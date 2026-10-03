import api from "./api";

export interface BannerDocument {
  _id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  desktopImage: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  position?: string;
  orderIndex?: number;
  isActive: boolean;
}

export const bannerService = {
  // Get active hero banners
  getActiveBanners: async (position = "hero_slider"): Promise<BannerDocument[]> => {
    return (await api.get("/banners", { params: { position } })) as unknown as BannerDocument[];
  },
};
