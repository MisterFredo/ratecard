export const dynamic = "auto"; // 🔥 on retire force-dynamic

import HomeClient from "./HomeClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "";

/* =========================================================
   SAFE FETCH (SSR SAFE)
========================================================= */
async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("❌ Fetch error:", url);
      return null;
    }

    return await res.json();

  } catch (e) {
    console.error("❌ Fetch exception:", url, e);
    return null;
  }
}

/* =========================================================
   PAGE — HOME RATECARD
========================================================= */
export default async function HomePage() {

  /* -------------------------------------------------------
     NEWS — FLUX PUBLIC RATECARD
  ------------------------------------------------------- */
  let news: any[] = [];

  try {
    const newsRaw = await safeFetch<{ news: any[] }>(
      `${API_BASE}/news/list`
    );

    if (newsRaw?.news) {
      news = newsRaw.news.map((n) => ({
        id: n.ID_NEWS,
        title: n.TITLE,
        excerpt: n.EXCERPT ?? null,

        visual_rect_id: n.VISUAL_RECT_ID ?? null,
        published_at: n.PUBLISHED_AT,

        // 🔑 STRUCTURE ÉDITORIALE
        news_kind: n.NEWS_KIND as "NEWS" | "BRIEF",

        company: n.ID_COMPANY
          ? {
              id_company: n.ID_COMPANY,
              name: n.COMPANY_NAME,
              media_logo_rectangle_id:
                n.MEDIA_LOGO_RECTANGLE_ID ?? null,
              is_partner: n.IS_PARTNER === true,
            }
          : undefined,
      }));
    }

  } catch (e) {
    console.error("❌ News fetch failed", e);
  }

  /* -------------------------------------------------------
     ANALYSES — FLUX PUBLIC (TEASING)
  ------------------------------------------------------- */
  let analyses: any[] = [];

  try {
    const analysesRaw = await safeFetch<{ items: any[] }>(
      `${API_BASE}/public/analysis/list`
    );

    if (analysesRaw?.items) {
      analyses = analysesRaw.items.map((a) => ({
        id: a.id,
        title: a.title,
        excerpt: a.excerpt ?? null,
        published_at: a.published_at,
        topics: a.topics ?? [],
        key_metrics: a.key_metrics ?? [],
        event: a.event,
      }));
    }

  } catch (e) {
    console.error("❌ Analyses fetch failed", e);
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <HomeClient
      news={news}
      analyses={analyses}
    />
  );
}
