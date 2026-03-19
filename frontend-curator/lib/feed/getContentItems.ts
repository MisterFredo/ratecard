import { api } from "@/lib/api";
import type { FeedItem } from "@/types/feed";

type Params = {
  query?: string;

  topic_ids?: string[];
  company_ids?: string[];
  solution_ids?: string[];

  news_types?: string[];

  limit?: number;
  offset?: number;
};

type FeedResponse = {
  items: FeedItem[];
  count: number;
};

export async function getContentItems(
  params: Params
): Promise<FeedResponse> {
  try {
    const query = new URLSearchParams();

    if (params.query) query.append("query", params.query);
    if (params.limit !== undefined) query.append("limit", String(params.limit));
    if (params.offset !== undefined) query.append("offset", String(params.offset));

    cleanArray(params.topic_ids).forEach((t) => query.append("topic_ids", t));
    cleanArray(params.company_ids).forEach((c) => query.append("company_ids", c));
    cleanArray(params.solution_ids).forEach((s) => query.append("solution_ids", s));

    const res = await api.get(`/curator/content?${query.toString()}`);

    const items: FeedItem[] = (res?.items || []).map((item: any) => ({
      id: item.id,
      type: "analysis",

      title: item.title,
      excerpt: item.excerpt || null,
      published_at: item.published_at || null,

      // 🔵 cohérent avec content
      company: null,

      has_visual: false,
      media_id: null,

      news_type: null,

      // 🔥 BADGES (clé UI)
      badges: item.badges || [],
    }));

    return {
      items,
      count: res?.count ?? items.length,
    };

  } catch (e) {
    console.error("❌ getContentItems error", e);
    return { items: [], count: 0 };
  }
}
