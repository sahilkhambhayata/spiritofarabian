/**
 * Base abstract interface for all logistics & courier providers.
 * All concrete providers (Shiprocket, DHL Express, Custom) must implement these methods.
 */
class BaseShippingProvider {
  constructor(name) {
    if (new.target === BaseShippingProvider) {
      throw new TypeError("Cannot construct BaseShippingProvider instances directly.");
    }
    this.name = name;
  }

  /**
   * Check if destination pincode / country is serviceable
   * @param {Object} params { deliveryPostcode, pickupPostcode, countryCode, cod, weightGrams }
   * @returns {Promise<{ isServiceable: boolean, availableCouriers: Array, reason?: string }>}
   */
  async checkServiceability(params) {
    throw new Error(`checkServiceability() not implemented in ${this.name}`);
  }

  /**
   * Calculate live shipping rates based on weight, dimensions, destination, and payment type
   * @param {Object} params { deliveryPostcode, pickupPostcode, countryCode, weightGrams, dimensions, cod, declaredValue }
   * @returns {Promise<Array<{ courierName: string, courierId: string|number, rate: number, estimatedDays: string|number }>>}
   */
  async getRates(params) {
    throw new Error(`getRates() not implemented in ${this.name}`);
  }

  /**
   * Create order/shipment in provider system
   * @param {Object} orderData Formatted order, customer details, items, package metrics
   * @returns {Promise<{ providerOrderId: string, providerShipmentId: string, status: string, raw: Object }>}
   */
  async createShipment(orderData) {
    throw new Error(`createShipment() not implemented in ${this.name}`);
  }

  /**
   * Assign courier and generate Air Waybill (AWB) number
   * @param {Object} params { providerShipmentId, courierId? }
   * @returns {Promise<{ awbCode: string, courierName: string, raw: Object }>}
   */
  async generateAwb(params) {
    throw new Error(`generateAwb() not implemented in ${this.name}`);
  }

  /**
   * Generate downloadable/printable shipping label
   * @param {Object} params { providerShipmentId, awbCode? }
   * @returns {Promise<{ labelUrl: string, raw: Object }>}
   */
  async generateLabel(params) {
    throw new Error(`generateLabel() not implemented in ${this.name}`);
  }

  /**
   * Request carrier pickup
   * @param {Object} params { providerShipmentId, pickupDate, pickupLocation }
   * @returns {Promise<{ pickupToken: string, scheduledDate: string, raw: Object }>}
   */
  async requestPickup(params) {
    throw new Error(`requestPickup() not implemented in ${this.name}`);
  }

  /**
   * Track shipment live by AWB or provider shipment ID
   * @param {Object} params { awbCode, providerShipmentId }
   * @returns {Promise<{ status: string, normalizedStatus: string, trackingEvents: Array, raw: Object }>}
   */
  async trackShipment(params) {
    throw new Error(`trackShipment() not implemented in ${this.name}`);
  }

  /**
   * Cancel an existing shipment/order
   * @param {Object} params { providerOrderId, providerShipmentId, awbCode }
   * @returns {Promise<{ success: boolean, message: string, raw: Object }>}
   */
  async cancelShipment(params) {
    throw new Error(`cancelShipment() not implemented in ${this.name}`);
  }

  /**
   * Parse and normalize inbound webhook event
   * @param {Object} payload Inbound webhook payload from provider
   * @param {Object} headers Inbound HTTP headers
   * @returns {{ isValid: boolean, awbCode?: string, providerShipmentId?: string, normalizedStatus?: string, event?: Object }}
   */
  parseWebhook(payload, headers) {
    throw new Error(`parseWebhook() not implemented in ${this.name}`);
  }
}

module.exports = BaseShippingProvider;
