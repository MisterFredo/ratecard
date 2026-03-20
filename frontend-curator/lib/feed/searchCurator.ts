// frontend-curator/lib/feed/searchCurator.ts

import { api } from "@/lib/api";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

function cleanArray(arr?: string[]) {
  if (!arr || arr.length === 0) return undefined;

  const cleaned = arr
    .map((v) => String(v))
    .filter((v) => v && v !== "undefined" && v !== "null");

  return cleaned.length > 0 ? cleaned : undefined;
}

/* ========================================================= */

type Params = {
  query?: string;

  topic_ids?: string[];
  company_ids?: string[];
  solution_ids?: string[];
  news_types?: string[];

  limit?: number;
  offset?: number;
};

/* ========================================================= */

export async function searchCurator(
  params: Params
): Promise<FeedItem[]> {
  try {
    const query = new URLSearchParams();

    if (params.query) query.append("query", params.query);
    if (params.limit !== undefined) query.append("limit", String(params.limit));
    if (params.offset !== undefined) query.append("offset", String(params.offset));

    cleanArray(params.topic_ids)?.forEach((t) =>
      query.append("topic_ids", t)
    );

    cleanArray(params.company_ids)?.forEach((c) =>
      query.append("company_ids", c)
    );

    cleanArray(params.solution_ids)?.forEach((s) =>
      query.append("solution_ids", s)
    );

    cleanArray(params.news_types)?.forEach((n) =>
      query.append("news_types", n)
    );

    const res = await api.get(`/search?${query.toString()}`);

    return (res || []) as FeedItem[];

  } catch (e) {
    console.error("❌ searchCurator error", e);
    return [];
  }
}
