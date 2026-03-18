import { api } from "@/lib/api";
import type { FeedItem } from "@/types/home";

type Params = {
  filters: {
    query?: string;
    badge?: string;
    contentType?: "all" | "analysis" | "news";
  };
  page: number;
  pageSize: number;
};

export async function getFeedItems({
  filters,
  page,
  pageSize,
}: Params): Promise<{ items: FeedItem[]; total: number }> {
  try {
    const params: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (filters.query) params.query = filters.query;
    if (filters.badge) params.badge = filters.badge;

    const items: FeedItem[] = [];

    // ================================
    // NEWS
    // ================================
    if (filters.contentType !== "analysis") {
      const newsRes = await api.get("/feed/news", { params });

      const newsItems: FeedItem[] = (newsRes?.items || []).map((n: any) => ({
        id: n.id_news,
        type: "news",
        title: n.title,
        excerpt: n.excerpt,
        date: n.published_at,
        badges: n.badges || [],
      }));

      items.push(...newsItems);
    }

    // ================================
    // ANALYSES
    // ================================
    if (filters.contentType !== "news") {
      const contentRes = await api.get("/feed/content", { params });

      const contentItems: FeedItem[] = (contentRes?.items || []).map((c: any) => ({
        id: c.id_content,
        type: "analysis",
        title: c.title,
        excerpt: c.excerpt,
        date: c.published_at,
        badges: c.badges || [],
      }));

      items.push(...contentItems);
    }

    // ================================
    // SORT
    // ================================
    items.sort(
      (a, b) =>
        new Date(b.date || 0).getTime() -
        new Date(a.date || 0).getTime()
    );

    return {
      items,
      total: items.length,
    };

  } catch (e) {
    console.error("❌ feed error", e);
    return { items: [], total: 0 };
  }
}
