import { apiUrl } from "@/lib/config";
import type { FeedItem } from "@/types/home";

type Params = {
  filters: {
    query?: string;
    badge?: string;
  };
  page: number;
  pageSize: number;
};

export async function getFeedItems({
  filters,
  page,
  pageSize,
}: Params): Promise<{ items: FeedItem[]; total: number }> {

  const query = new URLSearchParams();

  if (filters.query) query.append("query", filters.query);
  if (filters.badge) query.append("badge", filters.badge);
  query.append("limit", String(pageSize));
  query.append("offset", String((page - 1) * pageSize));

  try {
    const [newsRes, contentRes] = await Promise.all([
      fetch(apiUrl(`/feed/news?${query.toString()}`)),
      fetch(apiUrl(`/feed/content?${query.toString()}`)),
    ]);

    const newsJson = await newsRes.json();
    const contentJson = await contentRes.json();

    /* ============================
       MAPPING
    ============================ */

    const newsItems: FeedItem[] = (newsJson.items || []).map((n: any) => ({
      id: n.id_news,
      type: "source",
      title: n.title,
      excerpt: n.excerpt,
      date: n.published_at,
      badges: n.badges || [],
    }));

    const contentItems: FeedItem[] = (contentJson.items || []).map((c: any) => ({
      id: c.id_content,
      type: "analysis",
      title: c.title,
      excerpt: c.excerpt,
      date: c.published_at,
      badges: c.badges || [],
    }));

    /* ============================
       MERGE
    ============================ */

    const merged: FeedItem[] = [...contentItems, ...newsItems];

    /* ============================
       SCORING (🔥 clé curator)
    ============================ */

    function getScore(item: FeedItem): number {
      const dateScore = new Date(item.date || 0).getTime();

      // 🔥 boost analyses
      const typeBoost = item.type === "analysis" ? 10_000_000_000 : 0;

      return typeBoost + dateScore;
    }

    merged.sort((a, b) => getScore(b) - getScore(a));

    /* ============================
       RETURN
    ============================ */

    return {
      items: merged,
      total: merged.length,
    };

  } catch (e) {
    console.error("❌ feed error", e);
    return { items: [], total: 0 };
  }
}
