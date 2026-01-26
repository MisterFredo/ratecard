export const dynamic = "force-dynamic";

import HomeClient from "./HomeClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch error: ${url}`);
    return res.json();
  } catch (e) {
    console.error("Fetch failed", e);
    return null;
  }
}

export default async function HomePage() {
  /* ---------------------------------------------------------
     NEWS
  --------------------------------------------------------- */
  const newsRaw = await safeFetch<{ news: any[] }>(
    `${API_BASE}/news/list`
  );

  const news =
    newsRaw?.news.map((n) => ({
      id: n.ID_NEWS,
      title: n.TITLE,
      excerpt: n.EXCERPT ?? null,
      visual_rect_id: n.VISUAL_RECT_ID ?? null,
      published_at: n.PUBLISHED_AT,
      company: {
        id_company: n.ID_COMPANY,
        name: n.COMPANY_NAME,
        media_logo_rectangle_id: n.MEDIA_LOGO_RECTANGLE_ID ?? null,
        is_partner: n.IS_PARTNER === true,
      },
    })) ?? [];

  /* ---------------------------------------------------------
     ANALYSES — PUBLIC TEASING
  --------------------------------------------------------- */
  const analysesRaw = await safeFetch<{ items: any[] }>(
    `${API_BASE}/public/analysis/list`
  );

  const analyses =
    analysesRaw?.items.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      published_at: a.published_at,
      topics: a.topics ?? [],
    })) ?? [];

  return (
    <HomeClient
      news={news}
      analyses={analyses}
    />
  );
}
