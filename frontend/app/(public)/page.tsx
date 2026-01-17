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
  const [newsRaw, membersRaw] = await Promise.all([
    safeFetch<{ news: any[] }>(`${API_BASE}/news/list`),
    safeFetch<{ items: any[] }>(`${API_BASE}/public/members`),
  ]);

  /* ---------------------------------------------------------
     NEWS — mapping explicite
  --------------------------------------------------------- */
  const news = newsRaw.news.map((n) => ({
    id: n.ID_NEWS,
    title: n.TITLE,
    excerpt: n.EXCERPT ?? null,
    visual_rect_url: n.VISUAL_RECT_URL ?? null,
    company_visual_rect_id: n.COMPANY_VISUAL_RECT_ID ?? null,
    published_at: n.PUBLISHED_AT,
  }));

  /* ---------------------------------------------------------
     MEMBRES — mapping aligné MemberCard
  --------------------------------------------------------- */
  const members = membersRaw.items.map((m) => ({
    id: m.id_company,
    name: m.name,
    description: m.description ?? null,
    visualRectId: m.media_logo_rectangle_id ?? null,
  }));

  return (
    <HomeClient
      news={news}
      members={members}
    />
  );
}
