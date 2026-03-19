import { api } from "@/lib/api";

export async function getFeedMeta() {
  try {
    const res = await api.get("/api/curator/feed/meta");
    return res.data;
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
