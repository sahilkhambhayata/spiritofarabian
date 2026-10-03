import api from "./api";

export interface ProductVariant {
  _id?: string;
  size: number;
  unit: "ml";
  label?: string;
  price: number;
  compareAtPrice?: number | null;
  sku?: string;
  isDefault?: boolean;
  isActive?: boolean;
  weightGrams?: number | null;
}

export interface ProductDocument {
  _id: string;
  name: string;
  slug: string;
  arabicName?: string;
  tagline?: string;
  shortDescription?: string;
  description: string;
  brand?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    bannerImage?: string;
  };
  productType: "single_attar" | "combo" | "gift_box" | "discovery_set";
  fragrance?: {
    family?: string;
    gender?: "Men" | "Women" | "Unisex";
    concentration?: string;
    intensity?: string;
    longevity?: string;
    sillage?: string;
    origin?: string;
    season?: string[];
    suitableFor?: string[];
  };
  notes?: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
  ingredients?: string[];
  variants: ProductVariant[];
  bundle?: {
    isCustomizable?: boolean;
    maxItems?: number;
    includedProducts?: Array<{
      productId: any;
      variantId?: any;
      quantity?: number;
    }>;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  badge?: string;
  tags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  shipping?: {
    weightGrams?: number;
    dimensions?: { lengthCm?: number; widthCm?: number; heightCm?: number };
    hsCode?: string;
    countryOfOrigin?: string;
    internationalEligible?: boolean;
  };
}

export interface ProductListResponse {
  products: ProductDocument[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ShowcaseResponse {
  featured: ProductDocument[];
  bestSellers: ProductDocument[];
  newArrivals: ProductDocument[];
}

export const productService = {
  // Get paginated products with rich filters
  getProducts: async (params?: Record<string, any>): Promise<ProductListResponse> => {
    return (await api.get("/products", { params })) as unknown as ProductListResponse;
  },

  getAll: async (params?: Record<string, any>): Promise<ProductListResponse> => {
    return (await api.get("/products", { params })) as unknown as ProductListResponse;
  },

  // Get homepage showcase products (featured, bestsellers, new arrivals)
  getShowcase: async (): Promise<ShowcaseResponse> => {
    return (await api.get("/products/showcase/featured")) as unknown as ShowcaseResponse;
  },

  // Get product by slug
  getBySlug: async (slug: string): Promise<ProductDocument> => {
    return (await api.get(`/products/${encodeURIComponent(slug)}`)) as unknown as ProductDocument;
  },
};
