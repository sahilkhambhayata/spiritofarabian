import api from "./api";

export interface JournalArticleDocument {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  author: string;
  image: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface JournalListResponse {
  articles: JournalArticleDocument[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const journalService = {
  getArticles: async (params?: Record<string, any>): Promise<JournalListResponse> => {
    const res: any = await api.get("/journal", { params });
    if (res?.articles) return res;
    if (Array.isArray(res)) return { articles: res, pagination: { total: res.length, page: 1, pages: 1, limit: 10 } };
    if (res?.data?.articles) return res.data;
    return { articles: [], pagination: { total: 0, page: 1, pages: 1, limit: 10 } };
  },

  getBySlug: async (slug: string): Promise<JournalArticleDocument> => {
    const res: any = await api.get(`/journal/${encodeURIComponent(slug)}`);
    return res?.data !== undefined ? res.data : res;
  },
};
