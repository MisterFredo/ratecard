export const dynamic = "force-dynamic";

import { useState } from "react";
import DrawerContent from "@/components/DrawerContent";

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

/* API */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* SAFE FETCH */
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

/* LOADERS */
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

/* PAGE */
export default async function Home() {
  const [continuous, news, events] = await Promise.all([
    getContinuous(),
    getHomeNews(),
    getHomeEvents(),
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] =
    useState<"news" | "content" | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  function openDrawer(type: "news" | "content", id: string) {
    setDrawerType(type);
    setDrawerId(id);
    setDrawerOpen(true);
  }

  const une = news[0] || null;
  const otherNews = news.slice(1, 4);

  return (
    <>
      <div className="space-y-16">

        {/* EN CONTINU */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            En continu
          </h2>

          <ul className="space-y-1 text-sm text-gray-700">
            {continuous.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="cursor-pointer hover:underline"
                onClick={() =>
                  openDrawer(item.type, item.id)
                }
              >
                <span className="text-gray-400 mr-2">
                  [{item.type}]
                </span>
                {item.title}
              </li>
            ))}
          </ul>
        </section>

        {/* UNE */}
        {une && (
          <section
            className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start cursor-pointer"
            onClick={() => openDrawer("news", une.id)}
          >
            <img
              src={une.visual_rect_url}
              alt={une.title}
              className="w-full h-72 object-cover"
            />

            <div className="space-y-4">
              <span className="text-xs uppercase tracking-wide text-gray-500">
                News
              </span>

              <h1 className="text-3xl font-bold leading-tight">
                {une.title}
              </h1>

              {une.excerpt && (
                <p className="text-gray-700 text-base">
                  {une.excerpt}
                </p>
              )}
            </div>
          </section>
        )}

        {/* AUTRES NEWS */}
        {otherNews.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherNews.map((n) => (
              <article
                key={n.id}
                className="space-y-3 cursor-pointer"
                onClick={() => openDrawer("news", n.id)}
              >
                <img
                  src={n.visual_rect_url}
                  alt={n.title}
                  className="w-full h-40 object-cover"
                />
                <h3 className="font-semibold leading-snug">
                  {n.title}
                </h3>
                {n.excerpt && (
                  <p className="text-sm text-gray-600">
                    {n.excerpt}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}

        {/* EVENTS */}
        <section className="space-y-16">
          {events.map((block) => (
            <div key={block.event.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={block.event.visual_rect_url}
                  alt={block.event.label}
                  className="w-32 h-20 object-cover"
                />
                <h2 className="text-2xl font-semibold">
                  {block.event.home_label}
                </h2>
              </div>

              <ul className="space-y-4">
                {block.contents.map((c) => (
                  <li
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() =>
                      openDrawer("content", c.id)
                    }
                  >
                    <h3 className="font-medium hover:underline">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {c.excerpt}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

      </div>

      {/* DRAWER */}
      <DrawerContent
        open={drawerOpen}
        type={drawerType}
        id={drawerId}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
