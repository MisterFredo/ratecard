export const dynamic = "force-dynamic";

import HomeClient from "./HomeClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Fetch error");
  return res.json();
}

export default async function HomePage() {
  const newsRaw = await safeFetch<{ news: any[] }>(
    `${API_BASE}/news/list`
  );

  /* ---------------------------------------------------------
     NEWS — mapping AVEC CONTEXTE PARTENAIRE (DÉFINITIF)
  --------------------------------------------------------- */
  const news = newsRaw.news.map((n) => ({
    id: n.ID_NEWS,
    title: n.TITLE,
    excerpt: n.EXCERPT ?? null,
    visual_rect_url: n.VISUAL_RECT_URL ?? null,
    published_at: n.PUBLISHED_AT,

    company: {
      id_company: n.ID_COMPANY,
      name: n.COMPANY_NAME,
      logo_rect_id: n.MEDIA_LOGO_RECTANGLE_ID ?? null,
      is_partner: n.IS_PARTNER === true, // 👈 CLÉ MÉTIER
    },
  }));

  return (
    <HomeClient
      news={news}
    />
  );
}
