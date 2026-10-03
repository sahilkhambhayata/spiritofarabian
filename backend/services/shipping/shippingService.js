const Shipment = require("../../models/shipment");
const Order = require("../../models/order");
const Product = require("../../models/product");
const shiprocketService = require("./shiprocketService");
const dhlService = require("./dhlService");

class ShippingService {
  constructor() {
    this.providers = {
      shiprocket: shiprocketService,
      dhl: dhlService,
    };
  }

  /**
   * Determine logistics provider based on destination country
   */
  resolveProvider(country) {
    if (!country) return this.providers.shiprocket;
    const c = country.trim().toLowerCase();
    if (c === "india" || c === "in") {
      return this.providers.shiprocket;
    }
    return this.providers.dhl;
  }

  /**
   * Helper: Calculate total package weight & dimensions from order items
   */
  async calculatePackageMetrics(items) {
    let totalWeightGrams = 0;
    let missingWeight = false;
    const enrichedItems = [];

    for (const item of items) {
      let product = null;
      const prodRef = item.product || item.productId;
      if (require("mongoose").Types.ObjectId.isValid(prodRef)) {
        product = await Product.findById(prodRef);
      }
      if (!product && prodRef) {
        product = await Product.findOne({ slug: prodRef, isDeleted: false });
      }
      const qty = Number(item.quantity) || 1;
      
      let itemWeight = null;
      let hsCode = "";
      let internationalEligible = false;

      if (product) {
        // Check if variant has weight or product has shipping weight
        const variant = product.variants?.find((v) => v._id?.toString() === item.variantId?.toString());
        itemWeight = variant?.weightGrams || product.shipping?.weightGrams || null;
        hsCode = product.shipping?.hsCode || "";
        internationalEligible = Boolean(product.shipping?.internationalEligible);
      }

      if (itemWeight === null || itemWeight === undefined) {
        missingWeight = true;
      } else {
        totalWeightGrams += itemWeight * qty;
      }

      enrichedItems.push({
        ...item,
        weightGrams: itemWeight,
        hsCode,
        internationalEligible,
      });
    }

    return {
      totalWeightGrams: totalWeightGrams > 0 ? totalWeightGrams : null,
      missingWeight,
      enrichedItems,
    };
  }

  /**
   * Check delivery serviceability for given address & items
   */
  async checkServiceability({ country = "India", pincode, items = [], cod = false }) {
    if (!pincode) {
      return { isServiceable: false, reason: "Please enter a valid delivery postal/pincode." };
    }

    const { totalWeightGrams, enrichedItems } = await this.calculatePackageMetrics(items);
    const provider = this.resolveProvider(country);

    return await provider.checkServiceability({
      countryCode: country,
      deliveryPostcode: pincode,
      cod,
      weightGrams: totalWeightGrams || 500,
      items: enrichedItems,
    });
  }

  /**
   * Calculate live shipping options & fees
   */
  async calculateShippingOptions({ country = "India", pincode, items = [], cod = false, subTotal = 0 }) {
    const serviceability = await this.checkServiceability({ country, pincode, items, cod });
    
    if (!serviceability.isServiceable) {
      return {
        isServiceable: false,
        reason: serviceability.reason || "Address is not currently serviceable.",
        options: [],
      };
    }

    // Complimentary threshold logic (e.g. Free shipping above ₹1,500 in India)
    const isDomestic = country.trim().toLowerCase() === "india" || country.trim().toLowerCase() === "in";
    const isComplimentary = isDomestic && subTotal >= 1500;

    const availableCouriers = serviceability.availableCouriers || [];
    const options = availableCouriers.map((c) => ({
      courierId: c.courierId,
      courierName: c.courierName,
      serviceType: c.courierName.includes("Air") ? "Express Air" : "Standard Surface",
      estimatedDays: c.estimatedDays,
      originalRate: c.rate,
      finalShippingFee: isComplimentary ? 0 : c.rate,
      isComplimentary,
    }));

    return {
      isServiceable: true,
      provider: isDomestic ? "shiprocket" : "dhl",
      options,
    };
  }

  /**
   * Create and book a formal shipment for an confirmed Order
   */
  async createShipmentForOrder(orderId, options = {}) {
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }

    // Check if shipment already exists
    let existingShipment = await Shipment.findOne({ order: order._id });
    if (existingShipment && existingShipment.status !== "failed" && existingShipment.status !== "cancelled") {
      return existingShipment;
    }

    const provider = this.resolveProvider(order.shippingAddress.country);
    const providerName = order.shippingAddress.country?.toLowerCase() === "india" ? "shiprocket" : "dhl";

    const { totalWeightGrams, enrichedItems } = await this.calculatePackageMetrics(order.items);

    const shipmentData = await provider.createShipment({
      orderNumber: order.orderNumber,
      customerDetails: order.customerDetails,
      shippingAddress: order.shippingAddress,
      items: enrichedItems.map((it) => ({
        ...it,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        sku: it.sku,
        hsCode: it.hsCode,
      })),
      paymentMethod: order.paymentMethod,
      subTotal: order.subTotal,
      totalWeightGrams: totalWeightGrams || 500,
      pickupLocation: options.pickupLocation,
    });

    const shipment = await Shipment.create({
      order: order._id,
      orderNumber: order.orderNumber,
      provider: providerName,
      providerOrderId: shipmentData.providerOrderId,
      providerShipmentId: shipmentData.providerShipmentId,
      status: "created",
      totalWeightGrams: totalWeightGrams || 500,
      trackingEvents: [
        {
          status: "created",
          location: "Atelier Packing Hub",
          description: "Shipment record created with logistics provider.",
          timestamp: new Date(),
        },
      ],
      providerRawResponse: shipmentData.raw,
    });

    // Link shipment back to order
    order.shipment = shipment._id;
    await order.save();

    return shipment;
  }

  /**
   * Assign courier & generate AWB
   */
  async generateAwbForShipment(shipmentId, courierId) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const provider = this.providers[shipment.provider] || this.providers.shiprocket;
    const awbResult = await provider.generateAwb({
      providerShipmentId: shipment.providerShipmentId,
      courierId,
    });

    shipment.awbCode = awbResult.awbCode;
    shipment.courierName = awbResult.courierName;
    shipment.status = "awb_assigned";
    shipment.trackingEvents.push({
      status: "awb_assigned",
      location: "Courier Dispatch Center",
      description: `AWB ${awbResult.awbCode} assigned to ${awbResult.courierName}.`,
      timestamp: new Date(),
    });

    await shipment.save();

    // Update Order's tracking subdocument for backward compatibility
    await Order.findByIdAndUpdate(shipment.order, {
      "tracking.carrier": awbResult.courierName,
      "tracking.trackingNumber": awbResult.awbCode,
    });

    return shipment;
  }

  /**
   * Generate Shipping Label
   */
  async generateLabelForShipment(shipmentId) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const provider = this.providers[shipment.provider] || this.providers.shiprocket;
    const labelResult = await provider.generateLabel({
      providerShipmentId: shipment.providerShipmentId,
      awbCode: shipment.awbCode,
    });

    shipment.labelUrl = labelResult.labelUrl;
    await shipment.save();

    return shipment;
  }

  /**
   * Request Carrier Pickup
   */
  async requestPickupForShipment(shipmentId, pickupDate) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const provider = this.providers[shipment.provider] || this.providers.shiprocket;
    const pickupResult = await provider.requestPickup({
      providerShipmentId: shipment.providerShipmentId,
      pickupDate,
    });

    shipment.pickupTokenNumber = pickupResult.pickupToken;
    shipment.pickupScheduledDate = new Date(pickupResult.scheduledDate);
    shipment.status = "pickup_scheduled";
    shipment.trackingEvents.push({
      status: "pickup_scheduled",
      location: "Boutique Warehouse Vault",
      description: `Carrier pickup scheduled. Token: ${pickupResult.pickupToken}`,
      timestamp: new Date(),
    });

    await shipment.save();
    return shipment;
  }

  /**
   * Track Shipment by AWB or Order Number
   */
  async trackShipment(identifier) {
    const cleanId = identifier.trim();

    // Search by AWB or orderNumber or shipment ID
    let shipment = await Shipment.findOne({
      $or: [{ awbCode: cleanId }, { orderNumber: cleanId }, { providerShipmentId: cleanId }],
    }).populate("order");

    if (!shipment) {
      // Fallback: Check if an Order exists with this orderNumber
      const order = await Order.findOne({ orderNumber: cleanId });
      if (order) {
        return {
          orderNumber: order.orderNumber,
          carrier: order.tracking?.carrier || "BlueDart Express",
          trackingNumber: order.tracking?.trackingNumber || "",
          status: order.orderStatus,
          history: order.tracking?.history || [],
        };
      }
      throw new Error(`No shipment found matching '${identifier}'.`);
    }

    // Refresh live status from provider if AWB is present
    if (shipment.awbCode) {
      try {
        const provider = this.providers[shipment.provider] || this.providers.shiprocket;
        const liveTrack = await provider.trackShipment({
          awbCode: shipment.awbCode,
          providerShipmentId: shipment.providerShipmentId,
        });

        if (liveTrack.normalizedStatus) {
          shipment.status = liveTrack.normalizedStatus;
        }
        if (liveTrack.trackingEvents && liveTrack.trackingEvents.length > 0) {
          shipment.trackingEvents = liveTrack.trackingEvents;
        }
        shipment.lastTrackedAt = new Date();
        await shipment.save();
      } catch (err) {
        console.warn(`[Shipping Service] Live tracking refresh warning for ${shipment.awbCode}:`, err.message);
      }
    }

    return shipment;
  }

  /**
   * Cancel Shipment
   */
  async cancelShipment(shipmentId, reason = "") {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error("Shipment not found.");

    const provider = this.providers[shipment.provider] || this.providers.shiprocket;
    await provider.cancelShipment({
      providerOrderId: shipment.providerOrderId,
      providerShipmentId: shipment.providerShipmentId,
      awbCode: shipment.awbCode,
    });

    shipment.status = "cancelled";
    shipment.trackingEvents.push({
      status: "cancelled",
      location: "Logistics Control",
      description: reason || "Shipment booking cancelled.",
      timestamp: new Date(),
    });

    await shipment.save();

    // Update order status
    await Order.findByIdAndUpdate(shipment.order, {
      orderStatus: "Cancelled",
      cancelledReason: reason || "Shipment cancelled by admin",
      cancelledAt: new Date(),
    });

    return shipment;
  }

  /**
   * Handle Inbound Webhooks
   */
  async handleWebhook(providerName, payload, headers) {
    const provider = this.providers[providerName];
    if (!provider) throw new Error(`Unknown shipping provider: ${providerName}`);

    const parsed = provider.parseWebhook(payload, headers);
    if (!parsed.isValid) {
      return { processed: false, reason: "Invalid webhook payload or missing AWB identifier." };
    }

    const shipment = await Shipment.findOne({
      $or: [{ awbCode: parsed.awbCode }, { providerShipmentId: parsed.providerShipmentId }],
    });

    if (!shipment) {
      return { processed: false, reason: `No matching shipment found for AWB ${parsed.awbCode}` };
    }

    if (parsed.normalizedStatus) {
      shipment.status = parsed.normalizedStatus;
    }

    if (parsed.event) {
      shipment.trackingEvents.push(parsed.event);
    }

    await shipment.save();

    // Sync order status if delivered or RTO
    if (parsed.normalizedStatus === "delivered") {
      await Order.findByIdAndUpdate(shipment.order, { orderStatus: "Delivered" });
    } else if (parsed.normalizedStatus === "out_for_delivery") {
      await Order.findByIdAndUpdate(shipment.order, { orderStatus: "Out for Delivery" });
    }

    return { processed: true, shipmentId: shipment._id, status: shipment.status };
  }
}

module.exports = new ShippingService();
