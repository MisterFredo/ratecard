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
  const [news, analyses] = await Promise.all([
    safeFetch<{ news: any[] }>(`${API_BASE}/news/list`),
    safeFetch<{ items: any[] }>(`${API_BASE}/public/analysis/list`),
  ]);

  return (
    <HomeClient
      news={news.news}
      analyses={analyses.items}
    />
  );
}



