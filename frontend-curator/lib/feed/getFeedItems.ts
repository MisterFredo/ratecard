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

    let items: FeedItem[] = [];

    // ================================
    // NEWS (fallback-safe)
    // ================================
    if (filters.contentType !== "analysis") {
      try {
        const newsRes = await api.get(`/feed/news?${qs}`);

        console.log("🟡 RAW NEWS:", newsRes);

        const rawNews = newsRes?.items || newsRes || [];

        const newsItems: FeedItem[] = rawNews.map((n: any) => ({
          id: n.id_news || n.id || crypto.randomUUID(),
          type: "news",
          title: n.title || "No title",
          excerpt: n.excerpt || n.summary || "",
          date: n.published_at || n.date || null,
          badges: n.badges || n.topics || [],
        }));

        items.push(...newsItems);
      } catch (e) {
        console.warn("⚠️ news fetch failed (non bloquant)");
      }
    }

    // ================================
    // ANALYSES (clé du sujet)
    // ================================
    if (filters.contentType !== "news") {
      const contentRes = await api.get(`/public/analysis/list?${qs}`);

      console.log("🟢 RAW ANALYSIS:", contentRes);

      // ⚠️ très important : on sécurise tous les formats possibles
      const rawContent =
        contentRes?.items ||
        contentRes?.data ||
        contentRes ||
        [];

      const contentItems: FeedItem[] = rawContent.map((c: any) => ({
        id: c.id || c.id_content || crypto.randomUUID(),
        type: "analysis",
        title: c.title || "No title",
        excerpt: c.excerpt || c.summary || c.chapo || "",
        date: c.published_at || c.date || c.created_at || null,
        badges:
          c.badges ||
          c.topics ||
          c.topics_labels ||
          [],
      }));

      items.push(...contentItems);
    }

    // ================================
    // SORT GLOBAL
    // ================================
    items.sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      return db - da;
    });

    return {
      items,
      total: items.length,
    };
  } catch (e) {
    console.error("❌ feed error", e);
    return { items: [], total: 0 };
  }
}
