import { apiUrl } from "@/lib/config";

/* =========================================================
   TYPES
========================================================= */

export type FeedFilters = {
  query?: string;
  mode?: "explore" | "watch";
};

export type FeedItem = {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  badges?: {
    label: string;
    type: string;
  }[];
};

type Params = {
  filters: FeedFilters;
  page: number;
  pageSize: number;
};

/* =========================================================
   MAIN FUNCTION
========================================================= */

export async function getFeedItems({
  filters,
  page,
  pageSize,
}: Params): Promise<{
  items: FeedItem[];
  total: number;
}> {
  const query = new URLSearchParams();

  if (filters.query) query.append("query", filters.query);
  if (filters.mode) query.append("mode", filters.mode);

  query.append("limit", String(pageSize));
  query.append("offset", String((page - 1) * pageSize));

  try {
    const res = await fetch(
      apiUrl(`/api/v1/fiches?${query.toString()}`),
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Erreur API Feed");
    }

    const data = await res.json();

    /* =====================================================
       MAPPING
    ===================================================== */

    const items: FeedItem[] = (data.items || []).map((f: any) => ({
      id: f.id,
      title: f.title,
      excerpt: f.excerpt,
      date: f.date,
      badges: f.badges || [],
    }));

    return {
      items,
      total: data.total || items.length,
    };
  } catch (e) {
    console.error("❌ getFeedItems error:", e);
    return { items: [], total: 0 };
  }
}
