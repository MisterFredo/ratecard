import { api } from "@/lib/api";

export async function getFeedMeta() {
  try {
    const res = await api.get("/curator/feed/meta");

    return res; // ✅ déjà normalisé

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
