import { api } from "@/lib/api";
import type { FeedItem } from "@/types/feed";

/* =========================================================
   TYPES
========================================================= */

type Params = {
  query?: string;

  topic_ids?: string[];
  company_ids?: string[];
  solution_ids?: string[];

  types?: string[];
  news_types?: string[];

  limit?: number;
  offset?: number;
};

type Response = {
  items: FeedItem[];
  count: number;
};

/* =========================================================
   HELPERS
========================================================= */

function cleanArray(arr?: string[]) {
  if (!arr || arr.length === 0) return [];

  return arr
    .map((v) => String(v))
    .filter((v) => v && v !== "undefined" && v !== "null");
}

/* =========================================================
   API CALL
========================================================= */

export async function getFeedItems(
  params: Params
): Promise<Response> {
  try {
    const query = new URLSearchParams();

    /* ============================
       SIMPLE FIELDS
    ============================ */

    if (params.query) {
      query.append("query", params.query);
    }

    if (params.limit !== undefined) {
      query.append("limit", String(params.limit));
    }

    if (params.offset !== undefined) {
      query.append("offset", String(params.offset));
    }

    /* ============================
       ARRAY FIELDS (SAFE STRING ONLY)
    ============================ */

    cleanArray(params.topic_ids).forEach((t) =>
      query.append("topic_ids", t)
    );

    cleanArray(params.company_ids).forEach((c) =>
      query.append("company_ids", c)
    );

    cleanArray(params.solution_ids).forEach((s) =>
      query.append("solution_ids", s)
    );

    cleanArray(params.types).forEach((t) =>
      query.append("types", t)
    );

    cleanArray(params.news_types).forEach((nt) =>
      query.append("news_types", nt)
    );

    /* ============================
       DEBUG (à retirer après test)
    ============================ */

    console.log("FEED PARAMS", params);
    console.log("QUERY STRING", query.toString());

    /* ============================
       REQUEST
    ============================ */

    const res = await api.get(
      `/curator/feed?${query.toString()}`
    );

    /* ============================
       NORMALISATION
    ============================ */

    const rawItems = res?.items || [];

    const items: FeedItem[] = rawItems.map((item: any) => ({
      id: item.id,
      type: item.type,

      title: item.title,
      excerpt: item.excerpt || null,

      published_at: item.published_at || null,

      company: item.company || null,

      has_visual: item.has_visual || false,
      media_id: item.media_id || null,

      news_type: item.news_type || null,
    }));

    return {
      items,
      count: res?.count ?? items.length,
    };

  } catch (e) {
    console.error("❌ getFeedItems error", e);

    return {
      items: [],
      count: 0,
    };
  }
}
