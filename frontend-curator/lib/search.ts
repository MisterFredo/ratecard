import { api } from "@/lib/api";
import type { FeedItem, FeedResponse } from "@/types/feed";

/* ========================================================= */

type Params = {
  query?: string;
  limit?: number;
  offset?: number;

  // 🔥 NEW
  type?: "news" | "analysis";
};

/* ========================================================= */

function mapItem(row: any): FeedItem {
  return {
    id: row.id,
    type: row.type,

    title: row.title,
    excerpt: row.excerpt,
    published_at: row.published_at,

    topics: row.topics,
    companies: row.companies,
    solutions: row.solutions,

    news_type: row.news_type,
  };
}

/* ========================================================= */
// SEARCH
/* ========================================================= */

export async function searchCurator(
  params: Params
): Promise<FeedResponse> {
  try {
    const query = new URLSearchParams();

    if (params.query) {
      query.append("q", params.query.trim());
    }

    query.append("limit", String(params.limit ?? 20));
    query.append("offset", String(params.offset ?? 0));

    // 🔥 NEW
    if (params.type) {
      query.append("type", params.type);
    }

    const res = await api.get(`/curator/search?${query.toString()}`);
    const data = res?.data ?? res;

    if (!data || !Array.isArray(data.items)) {
      return { items: [], count: 0 };
    }

    return {
      items: data.items.map(mapItem),
      count: data.count ?? 0,
    };

  } catch (e) {
    console.error("❌ searchCurator error", e);
    return { items: [], count: 0 };
  }
}

/* ========================================================= */
// LATEST
/* ========================================================= */

export async function getLatestCurator(
  params?: Params
): Promise<FeedResponse> {
  try {
    const query = new URLSearchParams();

    query.append("limit", String(params?.limit ?? 20));
    query.append("offset", String(params?.offset ?? 0));

    // 🔥 NEW (important pour cohérence UX)
    if (params?.type) {
      query.append("type", params.type);
    }

    const res = await api.get(`/curator/latest?${query.toString()}`);
    const data = res?.data ?? res;

    if (!data || !Array.isArray(data.items)) {
      return { items: [], count: 0 };
    }

    return {
      items: data.items.map(mapItem),
      count: data.count ?? 0,
    };

  } catch (e) {
    console.error("❌ latestCurator error", e);
    return { items: [], count: 0 };
  }
}
