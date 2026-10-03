import api from "./api";

export interface VideoReviewDocument {
  _id: string;
  title: string;
  videoUrl: string;
  posterImage: string;
  duration?: string;
  creator: {
    name: string;
    handle?: string;
    avatar?: string;
    location?: string;
  };
  rating?: number;
  badge?: string;
  quote?: string;
  taggedProduct?: {
    _id: string;
    name: string;
    slug: string;
    variants?: any[];
  };
  orderIndex?: number;
  isActive: boolean;
}

export const videoService = {
  // Get active shoppable video reels
  getVideoReviews: async (): Promise<VideoReviewDocument[]> => {
    return (await api.get("/video-reviews")) as unknown as VideoReviewDocument[];
  },
};
