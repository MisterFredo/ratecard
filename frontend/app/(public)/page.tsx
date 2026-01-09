export const dynamic = "force-dynamic";

import HomeClient from "./HomeClient";

/* TYPES */
type ContinuousItem = {
  type: "news" | "content";
  id: string;
  title: string;
  published_at: string;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  published_at: string;
  visual_rect_url: string;
};

type EventContentItem = {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
};

type EventBlock = {
  event: {
    id: string;
    label: string;
    home_label: string;
    visual_rect_url: string;
  };
  contents: EventContentItem[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function safeFetch<T>(
  url: string,
  selector: (json: any) => T
): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return selector({});
    const json = await res.json();
    return selector(json);
  } catch {
    return selector({});
  }
}

async function getContinuous(): Promise<ContinuousItem[]> {
  return safeFetch(
    `${API_BASE}/public/home/continuous`,
    (json) => json.items ?? []
  );
}

async function getHomeNews(): Promise<NewsItem[]> {
  return safeFetch(
    `${API_BASE}/public/home/news`,
    (json) => json.items ?? []
  );
}

async function getHomeEvents(): Promise<EventBlock[]> {
  return safeFetch(
    `${API_BASE}/public/home/events`,
    (json) => json.events ?? []
  );
}

export default async function Home() {
  const [continuous, news, events] = await Promise.all([
    getContinuous(),
    getHomeNews(),
    getHomeEvents(),
  ]);

  return (
    <HomeClient
      continuous={continuous}
      news={news}
      events={events}
    />
  );
}
