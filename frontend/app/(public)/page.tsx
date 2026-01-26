// frontend/app/(public)/page.tsx

export const dynamic = "force-dynamic";

import HomeClient from "./HomeClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   SAFE FETCH
========================================================= */
async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Fetch error: ${url}`);
  }
  return res.json();
}

/* =========================================================
   PAGE — HOME RATECARD
========================================================= */
export default async function HomePage() {
  /* ---------------------------------------------------------
     NEWS
  --------------------------------------------------------- */
  const newsRaw = await safeFetch<{ news: any[] }>(
    `${API_BASE}/news/list`
  );

  const news = newsRaw.news.map((n) => ({
    id: n.ID_NEWS,
    title: n.TITLE,
    excerpt: n.EXCERPT ?? null,
    visual_rect_id: n.VISUAL_RECT_ID ?? null,
    published_at: n.PUBLISHED_AT,

    company: {
      id_company: n.ID_COMPANY,
      name: n.COMPANY_NAME,
      media_logo_rectangle_id:
        n.MEDIA_LOGO_RECTANGLE_ID ?? null,
      is_partner: n.IS_PARTNER === true,
    },
  }));

  /* ---------------------------------------------------------
     ANALYSES (TEASING HOME)
     ⚠️ TEMPORAIREMENT OUVERT — MODE TEST
  --------------------------------------------------------- */
  let analyses: {
    id: string;
    title: string;
    excerpt?: string;
    published_at: string;
    topics?: string[];
  }[] = [];

  try {
    const analysesRaw = await safeFetch<{ items: any[] }>(
      `${API_BASE}/analysis/list`
    );

    analyses = analysesRaw.items.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt ?? null,
      published_at: a.published_at,
      topics: a.topics ?? [],
    }));
  } catch (e) {
    // 🔒 Sécurité : la home ne doit jamais casser
    console.error("Analyses fetch failed", e);
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <HomeClient
      news={news}
      analyses={analyses}
    />
  );
}
