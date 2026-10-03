const BaseShippingProvider = require("./baseShippingProvider");

class ShiprocketService extends BaseShippingProvider {
  constructor() {
    super("Shiprocket");
    this.baseUrl = "https://apiv2.shiprocket.in/v1/external";
    this.email = process.env.SHIPROCKET_EMAIL || "";
    this.password = process.env.SHIPROCKET_PASSWORD || "";
    this.defaultPickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";
    this.environment = process.env.SHIPPING_ENVIRONMENT || "sandbox";
    
    // In-memory token cache with expiration (Shiprocket tokens expire in 10 days)
    this.cachedToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Helper: Check if configured with valid credentials
   */
  isConfigured() {
    return Boolean(this.email && this.password);
  }

  /**
   * Authenticate and get JWT token from Shiprocket
   */
  async getAuthToken() {
    if (!this.isConfigured()) {
      if (this.environment === "sandbox") {
        return "mock_sandbox_shiprocket_jwt_token";
      }
      throw new Error("Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured.");
    }

    // Check cached token
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiresAt && now < this.tokenExpiresAt - 60000) {
      return this.cachedToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || "Failed to authenticate with Shiprocket API.");
      }

      this.cachedToken = data.token;
      // Shiprocket tokens are valid for ~10 days (use 9 days to be safe)
      this.tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000;
      return this.cachedToken;
    } catch (error) {
      if (this.environment === "sandbox") {
        console.warn(`[Shiprocket Service] Live auth failed (${error.message}). Using sandbox mock mode.`);
        return "mock_sandbox_shiprocket_jwt_token";
      }
      throw error;
    }
  }

  /**
   * Generic authorized request helper
   */
  async request(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    if (token === "mock_sandbox_shiprocket_jwt_token") {
      return this.handleSandboxMock(endpoint, options);
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status}`);
      throw new Error(`Shiprocket API Error: ${errorMsg}`);
    }

    return data;
  }

  /**
   * Check delivery pincode serviceability
   */
  async checkServiceability({ deliveryPostcode, pickupPostcode, cod = false, weightGrams = 500 }) {
    const pickup = pickupPostcode || process.env.SHIPROCKET_DEFAULT_PICKUP_POSTCODE || "400001";
    const weightKg = Math.max(0.05, weightGrams / 1000);

    const query = new URLSearchParams({
      pickup_postcode: pickup,
      delivery_postcode: deliveryPostcode,
      cod: cod ? "1" : "0",
      weight: weightKg.toString(),
    });

    const data = await this.request(`/courier/serviceability/?${query.toString()}`);

    if (data.status === 200 && data.data && Array.isArray(data.data.available_courier_companies)) {
      const couriers = data.data.available_courier_companies.map((c) => ({
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        rate: Number(c.rate),
        estimatedDays: c.estimated_delivery_days,
        cod: Boolean(c.cod),
        etd: c.etd,
      }));

      return {
        isServiceable: couriers.length > 0,
        availableCouriers: couriers,
        raw: data,
      };
    }

    return {
      isServiceable: false,
      availableCouriers: [],
      reason: data.message || "Pincode is not serviceable by active couriers.",
      raw: data,
    };
  }

  /**
   * Calculate live shipping rates
   */
  async getRates(params) {
    const result = await this.checkServiceability(params);
    return result.availableCouriers || [];
  }

  /**
   * Create an order/shipment in Shiprocket
   */
  async createShipment(orderPayload) {
    const payload = {
      order_id: orderPayload.orderNumber,
      order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      pickup_location: orderPayload.pickupLocation || this.defaultPickupLocation,
      billing_customer_name: orderPayload.customerDetails.fullName,
      billing_last_name: "",
      billing_address: orderPayload.shippingAddress.street,
      billing_city: orderPayload.shippingAddress.city,
      billing_pincode: orderPayload.shippingAddress.pincode,
      billing_state: orderPayload.shippingAddress.state || "Maharashtra",
      billing_country: orderPayload.shippingAddress.country || "India",
      billing_email: orderPayload.customerDetails.email,
      billing_phone: orderPayload.customerDetails.phone,
      shipping_is_billing: true,
      order_items: orderPayload.items.map((item) => ({
        name: item.name,
        sku: item.sku || `SKU-${item.slug || "ITEM"}`,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: item.hsCode || "",
      })),
      payment_method: orderPayload.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: orderPayload.subTotal,
      length: orderPayload.dimensions?.lengthCm || 10,
      breadth: orderPayload.dimensions?.widthCm || 10,
      height: orderPayload.dimensions?.heightCm || 10,
      weight: Math.max(0.1, (orderPayload.totalWeightGrams || 500) / 1000),
    };

    const data = await this.request("/orders/create/adhoc", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      providerOrderId: data.order_id?.toString() || "",
      providerShipmentId: data.shipment_id?.toString() || "",
      status: data.status || "created",
      raw: data,
    };
  }

  /**
   * Assign courier and generate AWB
   */
  async generateAwb({ providerShipmentId, courierId }) {
    const body = { shipment_id: providerShipmentId };
    if (courierId) body.courier_id = courierId;

    const data = await this.request("/courier/assign/awb", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const responseData = data.response?.data || data;
    const awbCode = responseData.awb_code || data.awb_code || "";
    const courierName = responseData.courier_name || data.courier_name || "Express Courier";

    return {
      awbCode,
      courierName,
      raw: data,
    };
  }

  /**
   * Generate Shipping Label
   */
  async generateLabel({ providerShipmentId }) {
    const data = await this.request("/courier/generate/label", {
      method: "POST",
      body: JSON.stringify({ shipment_id: [providerShipmentId] }),
    });

    return {
      labelUrl: data.label_url || data.label_created_url || "",
      raw: data,
    };
  }

  /**
   * Request Carrier Pickup
   */
  async requestPickup({ providerShipmentId, pickupDate }) {
    const dateFormatted = pickupDate
      ? new Date(pickupDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const data = await this.request("/courier/generate/pickup", {
      method: "POST",
      body: JSON.stringify({
        shipment_id: [providerShipmentId],
        pickup_date: [dateFormatted],
      }),
    });

    return {
      pickupToken: data.response?.pickup_token_number || data.pickup_token_number || "PICKUP-CONFIRMED",
      scheduledDate: dateFormatted,
      raw: data,
    };
  }

  /**
   * Live Track Shipment by AWB
   */
  async trackShipment({ awbCode, providerShipmentId }) {
    const endpoint = awbCode
      ? `/courier/track/awb/${encodeURIComponent(awbCode)}`
      : `/courier/track/shipment/${encodeURIComponent(providerShipmentId)}`;

    const data = await this.request(endpoint);
    const trackingData = data.tracking_data || {};
    const trackActivities = trackingData.shipment_track_activities || [];

    const trackingEvents = trackActivities.map((act) => ({
      status: this.mapShiprocketStatus(act.current_status || act.status),
      location: act.location || "",
      description: act.activity || act["sr-status-label"] || "",
      timestamp: act.date ? new Date(act.date) : new Date(),
      rawProviderStatus: act.current_status || act.status,
    }));

    const currentStatus = trackingData.current_status || trackingData.track_status;
    const normalizedStatus = this.mapShiprocketStatus(currentStatus);

    return {
      status: currentStatus || "in_transit",
      normalizedStatus,
      courierName: trackingData.courier_name || "",
      trackingEvents,
      raw: data,
    };
  }

  /**
   * Cancel an order in Shiprocket
   */
  async cancelShipment({ providerOrderId }) {
    const data = await this.request("/orders/cancel", {
      method: "POST",
      body: JSON.stringify({ ids: [providerOrderId] }),
    });

    return {
      success: true,
      message: data.message || "Shiprocket order cancelled successfully.",
      raw: data,
    };
  }

  /**
   * Map Shiprocket specific status codes to clean internal statuses
   */
  mapShiprocketStatus(status) {
    if (!status) return "in_transit";
    const s = status.toString().toUpperCase();

    if (s.includes("DELIVERED")) return "delivered";
    if (s.includes("OUT FOR DELIVERY") || s.includes("OFD")) return "out_for_delivery";
    if (s.includes("IN TRANSIT") || s.includes("REACHED AT DESTINATION") || s.includes("SHIPPED")) return "in_transit";
    if (s.includes("PICKED UP") || s.includes("PICKUP DONE")) return "picked_up";
    if (s.includes("PICKUP SCHEDULED") || s.includes("OUT FOR PICKUP")) return "pickup_scheduled";
    if (s.includes("AWB ASSIGNED") || s.includes("MANIFEST GENERATED")) return "awb_assigned";
    if (s.includes("RTO DELIVERED")) return "rto_delivered";
    if (s.includes("RTO") || s.includes("RETURN TO ORIGIN")) return "rto_initiated";
    if (s.includes("CANCELED") || s.includes("CANCELLED")) return "cancelled";
    if (s.includes("FAILED") || s.includes("EXCEPTION")) return "failed";

    return "in_transit";
  }

  /**
   * Parse inbound Shiprocket webhook
   */
  parseWebhook(payload, headers) {
    // Shiprocket sends tracking webhook with awb, current_status, scans, etc.
    const awbCode = payload.awb || payload.awb_code || payload.tracking_id;
    const currentStatus = payload.current_status || payload.status;
    const normalizedStatus = this.mapShiprocketStatus(currentStatus);

    return {
      isValid: Boolean(awbCode),
      awbCode,
      providerShipmentId: payload.shipment_id?.toString() || "",
      normalizedStatus,
      event: {
        status: normalizedStatus,
        location: payload.location || payload.city || "Logistics Hub",
        description: payload.activity || payload.current_status || "Courier Status Update",
        timestamp: payload.date ? new Date(payload.date) : new Date(),
        rawProviderStatus: currentStatus,
      },
    };
  }

  /**
   * Sandbox Mock Handler (Guarantees safety during development without consuming credits)
   */
  handleSandboxMock(endpoint, options) {
    if (endpoint.includes("/courier/serviceability")) {
      return {
        status: 200,
        data: {
          available_courier_companies: [
            {
              courier_company_id: 1,
              courier_name: "BlueDart Express Air",
              rate: 150,
              estimated_delivery_days: 2,
              cod: 1,
              etd: "2 Days",
            },
            {
              courier_company_id: 2,
              courier_name: "Delhivery Surface Priority",
              rate: 120,
              estimated_delivery_days: 3,
              cod: 1,
              etd: "3 Days",
            },
          ],
        },
      };
    }

    if (endpoint.includes("/orders/create")) {
      const mockId = Math.floor(10000000 + Math.random() * 90000000);
      return {
        order_id: mockId,
        shipment_id: mockId + 100,
        status: "NEW",
      };
    }

    if (endpoint.includes("/courier/assign/awb")) {
      return {
        response: {
          data: {
            awb_code: `BD-${Math.floor(100000000 + Math.random() * 900000000)}`,
            courier_name: "BlueDart Express Air",
          },
        },
      };
    }

    if (endpoint.includes("/courier/generate/label")) {
      return {
        label_url: "https://shiprocket.co/mock-shipping-label.pdf",
        label_created: 1,
      };
    }

    if (endpoint.includes("/courier/generate/pickup")) {
      return {
        response: {
          pickup_token_number: `PKP-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      };
    }

    if (endpoint.includes("/courier/track")) {
      return {
        tracking_data: {
          current_status: "IN TRANSIT",
          courier_name: "BlueDart Express Air",
          shipment_track_activities: [
            {
              current_status: "PICKED UP",
              location: "Mumbai Central Hub",
              activity: "Consignment picked up and sealed in security vault container.",
              date: new Date(Date.now() - 24 * 3600000).toISOString(),
            },
            {
              current_status: "IN TRANSIT",
              location: "Air Cargo Terminal",
              activity: "Dispatched to destination transit station via express flight.",
              date: new Date().toISOString(),
            },
          ],
        },
      };
    }

    return { status: 200, message: "Sandbox mock operation succeeded." };
  }
}

module.exports = new ShiprocketService();
