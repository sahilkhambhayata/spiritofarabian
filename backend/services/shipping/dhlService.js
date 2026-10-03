const BaseShippingProvider = require("./baseShippingProvider");

/**
 * DHL Express / International Courier Provider Adapter
 * Implements strict international customs compliance, HS codes, and Dangerous Goods / Liquid restrictions.
 */
class DhlExpressService extends BaseShippingProvider {
  constructor() {
    super("DHL Express");
    this.apiKey = process.env.DHL_API_KEY || "";
    this.apiSecret = process.env.DHL_API_SECRET || "";
    this.accountNumber = process.env.DHL_ACCOUNT_NUMBER || "";
    this.environment = process.env.SHIPPING_ENVIRONMENT || "sandbox";
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiSecret && this.accountNumber);
  }

  /**
   * Verify international serviceability and product compliance
   */
  async checkServiceability({ countryCode, deliveryPostcode, items = [], totalWeightGrams = 500 }) {
    // 1. Validate destination country
    if (!countryCode || countryCode.toUpperCase() === "IN" || countryCode.toUpperCase() === "INDIA") {
      return {
        isServiceable: false,
        reason: "Domestic India orders are handled by India primary provider (Shiprocket).",
      };
    }

    // 2. Validate product-level international eligibility (liquids/alcohol restrictions)
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (item.internationalEligible === false) {
          return {
            isServiceable: false,
            reason: `Product '${item.name}' contains formulations restricted for international air courier transport.`,
            restrictedItem: item.name,
          };
        }
        if (!item.hsCode) {
          return {
            isServiceable: false,
            reason: `Product '${item.name}' requires a verified HS Code for international customs clearance.`,
            missingHsCodeItem: item.name,
          };
        }
      }
    }

    // In sandbox mode or when DHL is in staging
    return {
      isServiceable: true,
      availableCouriers: [
        {
          courierId: "DHL_EXPRESS_WORLDWIDE",
          courierName: "DHL Express Worldwide (Insured Air)",
          rate: 2499,
          estimatedDays: "3-5 Business Days",
          cod: false,
          customsTerms: "DDP (Delivered Duty Paid)",
        },
      ],
    };
  }

  async getRates(params) {
    const result = await this.checkServiceability(params);
    return result.availableCouriers || [];
  }

  async createShipment(orderPayload) {
    // Verify international compliance before booking
    const compliance = await this.checkServiceability({
      countryCode: orderPayload.shippingAddress.country,
      deliveryPostcode: orderPayload.shippingAddress.pincode,
      items: orderPayload.items,
    });

    if (!compliance.isServiceable) {
      throw new Error(`International Shipment Validation Failed: ${compliance.reason}`);
    }

    const mockDhlId = `DHL-ORD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const mockAwb = `DHL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    return {
      providerOrderId: mockDhlId,
      providerShipmentId: mockDhlId,
      awbCode: mockAwb,
      status: "created",
      raw: {
        provider: "DHL Express",
        customsInvoiceAttached: true,
        countryOfOrigin: "India",
      },
    };
  }

  async generateAwb({ providerShipmentId }) {
    return {
      awbCode: `DHL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      courierName: "DHL Express Worldwide",
      raw: {},
    };
  }

  async generateLabel({ providerShipmentId }) {
    return {
      labelUrl: "https://dhl.com/mock-dhl-air-waybill-label.pdf",
      raw: {},
    };
  }

  async requestPickup({ providerShipmentId, pickupDate }) {
    return {
      pickupToken: `DHL-PKP-${Math.floor(100000 + Math.random() * 900000)}`,
      scheduledDate: pickupDate || new Date().toISOString().slice(0, 10),
      raw: {},
    };
  }

  async trackShipment({ awbCode }) {
    return {
      status: "IN_TRANSIT",
      normalizedStatus: "in_transit",
      courierName: "DHL Express Worldwide",
      trackingEvents: [
        {
          status: "picked_up",
          location: "Dubai Royal Atelier Hub, UAE",
          description: "Shipment collected and sealed under climate-controlled vault standards.",
          timestamp: new Date(Date.now() - 3600000 * 24),
        },
        {
          status: "in_transit",
          location: "International Air Hub",
          description: "Processed through customs gateway facility.",
          timestamp: new Date(),
        },
      ],
      raw: {},
    };
  }

  async cancelShipment({ providerOrderId }) {
    return {
      success: true,
      message: `DHL International Consignment ${providerOrderId} cancelled successfully.`,
      raw: {},
    };
  }

  parseWebhook(payload, headers) {
    const awbCode = payload.shipmentTrackingNumber || payload.awb;
    return {
      isValid: Boolean(awbCode),
      awbCode,
      normalizedStatus: "in_transit",
      event: {
        status: "in_transit",
        location: payload.location || "International Hub",
        description: payload.description || "International Transit Checkpoint",
        timestamp: new Date(),
      },
    };
  }
}

module.exports = new DhlExpressService();
