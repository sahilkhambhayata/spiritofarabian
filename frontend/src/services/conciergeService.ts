import api from "./api";

export interface ConciergeInquiryPayload {
  name: string;
  email: string;
  phone: string;
  preferredScent?: string;
  preferredDate?: string;
  notes?: string;
  type?: "Private Fragrance Consultation" | "Scent Diagnostic Quiz Match" | "Bespoke Flacon Engraving" | "General Inquiry";
  quizResponses?: Record<string, any>;
}

export interface ConciergeInquiryResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  preferredScent: string;
  preferredDate?: string;
  notes?: string;
  type: string;
  status: string;
  createdAt: string;
}

export const conciergeService = {
  submitInquiry: async (payload: ConciergeInquiryPayload): Promise<ConciergeInquiryResponse> => {
    const response = await api.post<{ success: boolean; data: ConciergeInquiryResponse; message: string }>(
      "/concierge",
      payload
    );
    return response.data as unknown as ConciergeInquiryResponse;
  },

  getMyInquiries: async (): Promise<ConciergeInquiryResponse[]> => {
    const response = await api.get<{ success: boolean; data: ConciergeInquiryResponse[] }>(
      "/concierge/my-inquiries"
    );
    return response.data as unknown as ConciergeInquiryResponse[];
  },
};
