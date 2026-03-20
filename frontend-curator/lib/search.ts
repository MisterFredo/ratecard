// frontend-curator/lib/search.ts

import { api } from "@/lib/api";
import type { FeedItem, FeedResponse } from "@/types/feed";

/* ========================================================= */

type Params = {
  query: string;
  limit?: number;
};

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

    // 🔒 SAFE RESPONSE (aligné backend)
    if (!data || !Array.isArray(data.results)) {
      console.warn("⚠️ searchCurator: invalid response", data);
      return { items: [], count: 0 };
    }

    return {
      items: data.results as FeedItem[],
      count: data.count ?? data.results.length ?? 0,
    };

  } catch (e) {
    console.error("❌ searchCurator error", e);
    return { items: [], count: 0 };
  }
}
