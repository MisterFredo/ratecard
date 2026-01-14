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
  const [newsRaw, analyses] = await Promise.all([
    safeFetch<{ news: any[] }>(`${API_BASE}/news/list`),
    safeFetch<{ items: any[] }>(`${API_BASE}/public/analysis/list`),
  ]);

  // 🔁 mapping explicite news (MAJUSCULE → front)
  const news = newsRaw.news.map((n) => ({
    id: n.ID_NEWS,
    title: n.TITLE,
    excerpt: n.EXCERPT ?? null,
    visual_rect_url: n.VISUAL_RECT_URL,
    published_at: n.PUBLISHED_AT,
  }));

  return (
    <HomeClient
      news={news}
      analyses={analyses.items}
    />
  );
}
