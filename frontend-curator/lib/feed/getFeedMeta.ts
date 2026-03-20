// frontend-curator/lib/feed/getFeedMeta.ts

import { api } from "@/lib/api";

/* ========================================================= */

type MetaItem = {
  id: string;
  label: string;
  count: number;
};

export type FeedMeta = {
  topics: MetaItem[];
  companies: MetaItem[];
  solutions: MetaItem[];
  news_types: MetaItem[];
};

/* ========================================================= */

function safeArray(value: any): MetaItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((v) => ({
    id: String(v.id),
    label: String(v.label),
    count: Number(v.count ?? 0),
  }));
}

/* ========================================================= */

export async function getFeedMeta(): Promise<FeedMeta> {
  try {
    const res = await api.get("/meta");

    return {
      topics: safeArray(res?.topics),
      companies: safeArray(res?.companies),
      solutions: safeArray(res?.solutions),
      news_types: safeArray(res?.news_types),
    };

  } catch (e) {
    console.error("❌ getFeedMeta error", e);

    return {
      topics: [],
      companies: [],
      solutions: [],
      news_types: [],
    };
  }
}
