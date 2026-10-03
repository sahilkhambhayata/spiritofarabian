import api from "./api";

export interface CreateOrderItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItem[];
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    pincode: string;
    country?: string;
  };
  giftOptions?: {
    isGift: boolean;
    giftWrap?: boolean;
    giftMessage?: string;
  };
  paymentMethod: "Razorpay" | "Stripe" | "COD";
  couponApplied?: string;
  discountAmount?: number;
  shippingFee?: number;
  shippingTier?: "shiprocket_surface" | "shiprocket_express" | "dhl_express_worldwide";
}

export interface OrderDocument {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
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
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    history?: Array<{
      status: string;
      location: string;
      timestamp: string;
      note?: string;
    }>;
  };
  createdAt: string;
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<OrderDocument> => {
    const response = await api.post<{ success: boolean; data: OrderDocument; message: string }>(
      "/orders",
      payload
    );
    return response.data as unknown as OrderDocument;
  },

  getOrderById: async (id: string): Promise<OrderDocument> => {
    const response = await api.get<{ success: boolean; data: OrderDocument }>(`/orders/${id}`);
    return response.data as unknown as OrderDocument;
  },
};
