
import { api } from "@/lib/api";

export async function getContentStats() {
  try {
    const res = await api.get("/curator/stats");
    const data = res?.data ?? res;

    if (!data || !data.stats) {
      return null;
    }

    return data.stats;

  } catch (e) {
    console.error("❌ getContentStats error", e);
    return null;
  }
}
