import { api } from "@/lib/api";
import type { FeedItem } from "@/types/feed";

/* =========================================================
   TYPES
========================================================= */

type Params = {
  query?: string;

  topics?: string[];
  companies?: string[];
  solutions?: string[];

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

    if (params.limit) {
      query.append("limit", String(params.limit));
    }

    if (params.offset) {
      query.append("offset", String(params.offset));
    }

    /* ============================
       ARRAY FIELDS
    ============================ */

    params.topics?.forEach((t) =>
      query.append("topics", t)
    );

    params.companies?.forEach((c) =>
      query.append("companies", c)
    );

    params.solutions?.forEach((s) =>
      query.append("solutions", s)
    );

    params.types?.forEach((t) =>
      query.append("types", t)
    );

    params.news_types?.forEach((nt) =>
      query.append("news_types", nt)
    );

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
      type: item.type, // "news" | "analysis"

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
