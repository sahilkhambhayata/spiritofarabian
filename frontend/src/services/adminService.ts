import api from "./api";

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  salesGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
  weeklyRevenue: {
    labels: string[];
    currentWeek: number[];
    previousWeek: number[];
  };
  salesByLocation: Array<{ city: string; sales: number; percentage: number }>;
  salesChannels: Array<{ channel: string; amount: number; percentage: number; color: string }>;
  topSellingProducts: Array<{
    _id: string;
    name: string;
    image: string;
    category: string;
    price: number;
    unitsSold: number;
    revenue: number;
  }>;
}

export const adminService = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res: any = await api.post("/users/login", credentials);
    if (res?.token) {
      localStorage.setItem("soa_auth_token", res.token);
      localStorage.setItem("soa_admin_user", JSON.stringify(res.user));
    }
    return res;
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("soa_admin_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("soa_auth_token");
    localStorage.removeItem("soa_admin_user");
  },

  // Media Upload
  uploadMedia: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    return (await api.post("/upload/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })) as unknown as { url: string; filename: string };
  },

  uploadMultipleMedia: async (files: File[]): Promise<Array<{ url: string; filename: string }>> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return (await api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })) as unknown as Array<{ url: string; filename: string }>;
  },

  // Products CRUD
  createProduct: async (data: any) => {
    return await api.post("/products", data);
  },
  updateProduct: async (id: string, data: any) => {
    return await api.put(`/products/${id}`, data);
  },
  deleteProduct: async (id: string) => {
    return await api.delete(`/products/${id}`);
  },

  // Categories CRUD
  getCategories: async () => {
    return await api.get("/categories");
  },
  createCategory: async (data: any) => {
    return await api.post("/categories", data);
  },
  updateCategory: async (id: string, data: any) => {
    return await api.put(`/categories/${id}`, data);
  },
  deleteCategory: async (id: string) => {
    return await api.delete(`/categories/${id}`);
  },

  // Orders Management
  getAllOrders: async (params?: Record<string, any>) => {
    return await api.get("/orders", { params });
  },
  updateOrderStatus: async (orderId: string, status: string, notes?: string) => {
    return await api.put(`/orders/${orderId}/status`, { orderStatus: status, notes });
  },
  updateOrderTracking: async (orderId: string, trackingData: { courierName: string; trackingNumber: string; trackingUrl?: string }) => {
    return await api.put(`/orders/${orderId}/tracking`, trackingData);
  },

  // Banners CMS
  getBanners: async () => {
    return await api.get("/banners");
  },
  createBanner: async (data: any) => {
    return await api.post("/banners", data);
  },
  updateBanner: async (id: string, data: any) => {
    return await api.put(`/banners/${id}`, data);
  },
  deleteBanner: async (id: string) => {
    return await api.delete(`/banners/${id}`);
  },

  // Video Reviews UGC
  getVideos: async () => {
    return await api.get("/video-reviews");
  },
  createVideo: async (data: any) => {
    return await api.post("/video-reviews", data);
  },
  updateVideo: async (id: string, data: any) => {
    return await api.put(`/video-reviews/${id}`, data);
  },
  deleteVideo: async (id: string) => {
    return await api.delete(`/video-reviews/${id}`);
  },

  // Coupons
  getCoupons: async () => {
    return await api.get("/coupons");
  },
  createCoupon: async (data: any) => {
    return await api.post("/coupons", data);
  },
  updateCoupon: async (id: string, data: any) => {
    return await api.put(`/coupons/${id}`, data);
  },
  deleteCoupon: async (id: string) => {
    return await api.delete(`/coupons/${id}`);
  },

  // Reviews Moderation
  getReviews: async (params?: any) => {
    return await api.get("/reviews", { params });
  },
  approveReview: async (id: string) => {
    return await api.put(`/reviews/${id}/approve`);
  },
  deleteReview: async (id: string) => {
    return await api.delete(`/reviews/${id}`);
  },

  // Concierge Leads
  getConciergeLeads: async (params?: any) => {
    return await api.get("/concierge", { params });
  },
  updateConciergeStatus: async (id: string, status: string, notes?: string) => {
    return await api.put(`/concierge/${id}`, { status, notes });
  },

  // Journal / Blog CMS
  getArticles: async (params?: any) => {
    return await api.get("/journal", { params });
  },
  createArticle: async (data: any) => {
    return await api.post("/journal", data);
  },
  updateArticle: async (id: string, data: any) => {
    return await api.put(`/journal/${id}`, data);
  },
  deleteArticle: async (id: string) => {
    return await api.delete(`/journal/${id}`);
  },

  // Policies & FAQs
  getInformation: async () => {
    return await api.get("/information");
  },
  updateInformation: async (data: any) => {
    return await api.put("/information", data);
  },

  // Settings & SMTP Test
  getSettings: async () => {
    return await api.get("/settings");
  },
  updateSettings: async (data: any) => {
    return await api.put("/settings", data);
  },
  testSmtp: async (data: { targetEmail: string; smtpConfig?: any }) => {
    return await api.post("/settings/test-smtp", data);
  },

  // Abandoned Carts
  getAbandonedCarts: async (params?: any) => {
    return await api.get("/cart/abandoned", { params });
  },
  sendCartReminder: async (cartId: string) => {
    return await api.post(`/cart/abandoned/${cartId}/send-reminder`);
  },

  // Email Notification Templates Studio
  getEmailTemplates: async () => {
    return await api.get("/email-templates");
  },
  getEmailTemplate: async (key: string) => {
    return await api.get(`/email-templates/${key}`);
  },
  updateEmailTemplate: async (key: string, data: any) => {
    return await api.put(`/email-templates/${key}`, data);
  },
  testEmailTemplate: async (key: string, data: { targetEmail: string; customConfig?: any }) => {
    return await api.post(`/email-templates/${key}/test`, data);
  },
  resetEmailTemplates: async (key?: string) => {
    return await api.post("/email-templates/reset-defaults", { key });
  },
};

export default adminService;
