import api from "./api";

export interface PolicySection {
  _id?: string;
  heading: string;
  content: string;
  order?: number;
}

export interface PolicyHighlight {
  icon?: string;
  title: string;
  description: string;
}

export interface PolicyDocument {
  _id: string;
  policy_type: "shipping" | "return" | "privacy" | "terms" | "refund" | "custom";
  title: string;
  path: string;
  subtitle?: string;
  lastUpdated: string;
  highlights?: PolicyHighlight[];
  sections: PolicySection[];
  isActive: boolean;
}

export interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SiteSettings {
  announcementBarText: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  supportEmail: string;
  supportPhone: string;
  boutiqueAddress: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
  };
  faqs: FAQItem[];
}

export const policyService = {
  // Get all active policies
  getAllPolicies: async (): Promise<PolicyDocument[]> => {
    return (await api.get("/information")) as unknown as PolicyDocument[];
  },

  // Get policy by identifier (e.g. 'shipping-policy' or 'shipping')
  getPolicyByIdentifier: async (identifier: string): Promise<PolicyDocument> => {
    return (await api.get(`/information/${identifier}`)) as unknown as PolicyDocument;
  },

  // Get site settings including FAQs
  getSettings: async (): Promise<SiteSettings> => {
    return (await api.get("/settings")) as unknown as SiteSettings;
  },
};
