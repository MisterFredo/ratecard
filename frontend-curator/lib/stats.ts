import { api } from "@/lib/api";

/* ========================================================= */

export async function getContentStats() {
  try {
    const res = await api.get("/curator/stats");

    const data = res?.data ?? res;

    return data ?? null;

  } catch (e) {
    console.error("❌ getContentStats error", e);
    return null;
  }
}
