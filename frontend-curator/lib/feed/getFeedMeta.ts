import { api } from "@/lib/api";

export async function getFeedMeta() {
  try {
    const res = await api.get("/curator/meta"); // ✅ FIX ICI

    return res;

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
