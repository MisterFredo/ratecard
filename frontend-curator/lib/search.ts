// frontend-curator/lib/search.ts

import { api } from "@/lib/api";
import type { FeedItem, FeedResponse } from "@/types/feed";

/* ========================================================= */

type Params = {
  query: string;
  limit?: number;
};

/* ========================================================= */
// 🔥 MAPPING CRITIQUE
/* ========================================================= */

function mapItem(row: any): FeedItem {
  return {
    id: row.ID,
    title: row.TITLE,
    excerpt: row.EXCERPT,
    published_at: row.PUBLISHED_AT,
    type: row.SOURCE_TYPE === "NEWS" ? "news" : "analysis",
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

    // 🔒 SAFE RESPONSE
    if (!data || !Array.isArray(data.results)) {
      console.warn("⚠️ searchCurator: invalid response", data);
      return { items: [], count: 0 };
    }

    const items = data.results.map(mapItem);

    return {
      items,
      count: data.count ?? items.length,
    };

  } catch (e) {
    console.error("❌ searchCurator error", e);
    return { items: [], count: 0 };
  }
}
