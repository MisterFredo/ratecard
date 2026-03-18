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
    const query = new URLSearchParams();

    if (filters.query) query.append("query", filters.query);
    if (filters.badge) query.append("badge", filters.badge);

    query.append("limit", String(pageSize));
    query.append("offset", String((page - 1) * pageSize));

    const qs = query.toString();

    const items: FeedItem[] = [];

    // ================================
    // NEWS
    // ================================
    if (filters.contentType !== "analysis") {
      const newsRes = await api.get(`/feed/news?${qs}`);

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
      const contentRes = await api.get(`/public/analysis/list?${qs}`);

      const contentItems: FeedItem[] = (contentRes?.items || []).map((c: any) => ({
        id: c.id, // ✅ CORRECT
        type: "analysis",
        title: c.title,
        excerpt: c.excerpt,
        date: c.published_at,
        badges: c.topics || [], // ⚠️ adaptation
      }));

      items.push(...contentItems);
    }

    // ================================
    // SORT GLOBAL
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
