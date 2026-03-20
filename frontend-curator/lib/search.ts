import { api } from "@/lib/api";
import type { FeedItem, FeedResponse } from "@/types/feed";

/* ========================================================= */

type Params = {
  query: string;
  limit?: number;
};

/* ========================================================= */
// 🔥 MAPPING NOUVEAU BACKEND
/* ========================================================= */

function mapItem(row: any): FeedItem {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    published_at: row.published_at,
    type: row.type,

    // 🔥 badges
    topics: row.topics ?? [],
    companies: row.companies ?? [],
    solutions: row.solutions ?? [],
    news_type: row.news_type ?? null,
  };
}

/* ========================================================= */

export async function searchCurator(
  params: Params
): Promise<FeedResponse> {
  try {
    const query = new URLSearchParams();

    if (!params.query || params.query.trim() === "") {
      return { items: [], count: 0 };
    }

    query.append("q", params.query.trim());

    if (params.limit !== undefined) {
      query.append("limit", String(params.limit));
    }

    const res = await api.get(`/curator/search?${query.toString()}`);

    const data = res?.data ?? res;

    // ✅ FIX PRINCIPAL
    if (!data || !Array.isArray(data.items)) {
      console.warn("⚠️ searchCurator: invalid response", data);
      return { items: [], count: 0 };
    }

    const items = data.items.map(mapItem);

    return {
      items,
      count: data.count ?? items.length,
    };

  } catch (e) {
    console.error("❌ searchCurator error", e);
    return { items: [], count: 0 };
  }
}
