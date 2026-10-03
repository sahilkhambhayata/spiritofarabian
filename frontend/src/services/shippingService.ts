import api from "./api";

export interface TrackingEvent {
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
  rawProviderStatus?: string;
}

export interface LiveShipmentData {
  _id?: string;
  orderNumber: string;
  provider?: string;
  awbCode?: string;
  courierName?: string;
  status: string;
  shippingCost?: number;
  totalWeightGrams?: number;
  labelUrl?: string;
  pickupTokenNumber?: string;
  pickupScheduledDate?: string;
  trackingEvents: TrackingEvent[];
  lastTrackedAt?: string;
  order?: {
    _id: string;
    orderNumber: string;
    customerDetails: {
      fullName: string;
      email: string;
      phone: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    items: Array<{
      product?: string;
      name: string;
      size: string;
      price: number;
      quantity: number;
      image?: string;
    }>;
    totalAmount: number;
    paymentMethod: string;
    orderStatus: string;
  };
}

export interface ServiceabilityResponse {
  isServiceable: boolean;
  reason?: string;
  availableCouriers?: Array<{
    courierId: string | number;
    courierName: string;
    rate: number;
    estimatedDays: string | number;
    cod: boolean;
    etd?: string;
  }>;
}

export interface ShippingRatesResponse {
  isServiceable: boolean;
  reason?: string;
  provider?: string;
  options: Array<{
    courierId: string | number;
    courierName: string;
    serviceType: string;
    estimatedDays: string | number;
    originalRate: number;
    finalShippingFee: number;
    isComplimentary: boolean;
  }>;
}

export const shippingService = {
  // Check delivery pincode serviceability & product restrictions
  checkServiceability: async (payload: {
    country?: string;
    pincode: string;
    items?: any[];
    cod?: boolean;
  }): Promise<ServiceabilityResponse> => {
    return (await api.post("/shipping/check-serviceability", payload)) as unknown as ServiceabilityResponse;
  },

  // Calculate live shipping fees and courier tiers
  calculateRates: async (payload: {
    country?: string;
    pincode: string;
    items?: any[];
    cod?: boolean;
    subTotal: number;
  }): Promise<ShippingRatesResponse> => {
    return (await api.post("/shipping/calculate-rates", payload)) as unknown as ShippingRatesResponse;
  },

  // Track shipment / order live by Order Number or AWB Code
  trackShipment: async (identifier: string): Promise<LiveShipmentData> => {
    return (await api.get(`/shipping/track/${encodeURIComponent(identifier.trim())}`)) as unknown as LiveShipmentData;
  },
};
