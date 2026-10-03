import api from "./api";

export interface ReviewDocument {
  _id: string;
  product: string;
  name: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase?: boolean;
  images?: string[];
  createdAt: string;
}

export const reviewService = {
  // Get approved reviews for a product
  getProductReviews: async (productId: string): Promise<ReviewDocument[]> => {
    return (await api.get(`/reviews/product/${productId}`)) as unknown as ReviewDocument[];
  },

  // Submit new review
  submitReview: async (payload: {
    productId: string;
    name: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<ReviewDocument> => {
    return (await api.post("/reviews", payload)) as unknown as ReviewDocument;
  },
};
