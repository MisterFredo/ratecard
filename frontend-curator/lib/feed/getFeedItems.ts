import { api } from "@/lib/api";
import type { FeedItem } from "@/types/home";

type Params = {
  page: number;
  pageSize: number;
};

type Response = {
  items: FeedItem[];
  total: number;
};

export async function getFeedItems({
  page,
  pageSize,
}: Params): Promise<Response> {
  try {
    const query = new URLSearchParams();

    query.append("limit", String(pageSize));
    query.append("offset", String((page - 1) * pageSize));

    const res = await api.get(`/curator/feed?${query.toString()}`);

    // 🔒 sécurisation max
    const rawItems = res?.items || [];

    const items: FeedItem[] = rawItems.map((item: any) => ({
      id: item.id,
      type: item.type, // "news" | "analysis"
      title: item.title,
      excerpt: item.excerpt || "",
      signal: item.signal || null,
      concept: item.concept || null,
      published_at: item.published_at || null,
      company: item.company || null,
    }));

    return {
      items,
      total: res?.total || items.length,
    };
  } catch (e) {
    console.error("❌ getFeedItems error", e);
    return {
      items: [],
      total: 0,
    };
  }
}
