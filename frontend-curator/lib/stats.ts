import { api } from "@/lib/api";

/* ========================================================= */

type StatsParams = {
  user_id?: string;
  universe_id?: string | null;
};

/* ========================================================= */

export async function getContentStats(
  params?: StatsParams
) {
  try {
    const query = new URLSearchParams();

    // 🔥 NEW
    if (params?.user_id) {
      query.append("user_id", params.user_id);
    }

    if (params?.universe_id) {
      query.append("universe_id", params.universe_id);
    }

    const url = `/curator/stats${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const res = await api.get(url);
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
