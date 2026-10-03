import api from "./api";

export interface CategoryDocument {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  icon?: string;
  orderIndex?: number;
  isActive: boolean;
}

export const categoryService = {
  // Get all active categories
  getCategories: async (): Promise<CategoryDocument[]> => {
    return (await api.get("/categories")) as unknown as CategoryDocument[];
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<CategoryDocument> => {
    return (await api.get(`/categories/${encodeURIComponent(slug)}`)) as unknown as CategoryDocument;
  },
};
