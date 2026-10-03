import api from "./api";

export interface ValidateCouponPayload {
  code: string;
  orderAmount: number;
}

export interface CouponValidationResult {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

export const couponService = {
  validate: async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
    const response = await api.post<{ success: boolean; data: CouponValidationResult; message: string }>(
      "/coupons/validate",
      { code, orderAmount }
    );
    return response.data as unknown as CouponValidationResult;
  },
};
