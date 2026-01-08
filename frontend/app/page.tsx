export const dynamic = "force-dynamic";

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

/* -------------------------------------------------------
   SAFE FETCH HELPERS
------------------------------------------------------- */

async function safeFetch<T>(
  url: string,
  selector: (json: any) => T
): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("Fetch failed:", url, res.status);
      return selector({});
    }

    const json = await res.json();
    return selector(json);
  } catch (e) {
    console.error("Fetch error:", url, e);
    return selector({});
  }
}

/* -------------------------------------------------------
   DATA LOADERS
------------------------------------------------------- */

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

/* -------------------------------------------------------
   PAGE
------------------------------------------------------- */

export default async function Home() {
  const [continuous, news, events] = await Promise.all([
    getContinuous(),
    getHomeNews(),
    getHomeEvents(),
  ]);

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-12">
      {/* -------------------------------- */}
      {/* CONTINUOUS BAND */}
      {/* -------------------------------- */}
      <section>
        <h2 className="text-sm font-semibold uppercase mb-3">
          En continu
        </h2>

        {continuous.length === 0 ? (
          <p className="text-sm opacity-50">Aucun contenu</p>
        ) : (
          <ul className="space-y-1">
            {continuous.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="text-sm"
              >
                <span className="opacity-50 mr-2">
                  [{item.type}]
                </span>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* -------------------------------- */}
      {/* NEWS BLOCK */}
      {/* -------------------------------- */}
      <section>
        <h2 className="text-lg font-semibold mb-4">News</h2>

        {news.length === 0 ? (
          <p className="text-sm opacity-50">Aucune news</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {news.map((n) => (
              <article
                key={n.id}
                className="border p-4 space-y-2"
              >
                <img
                  src={n.visual_rect_url}
                  alt={n.title}
                  className="w-full h-40 object-cover"
                />
                <h3 className="font-medium">{n.title}</h3>
                {n.excerpt && (
                  <p className="text-sm opacity-70">
                    {n.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------- */}
      {/* EVENTS BLOCKS */}
      {/* -------------------------------- */}
      <section className="space-y-10">
        {events.length === 0 ? (
          <p className="text-sm opacity-50">
            Aucun événement actif
          </p>
        ) : (
          events.map((block) => (
            <div key={block.event.id}>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={block.event.visual_rect_url}
                  alt={block.event.label}
                  className="w-32 h-20 object-cover"
                />
                <h2 className="text-xl font-semibold">
                  {block.event.home_label}
                </h2>
              </div>

              {block.contents.length === 0 ? (
                <p className="text-sm opacity-50">
                  Aucun contenu
                </p>
              ) : (
                <ul className="space-y-2">
                  {block.contents.map((c) => (
                    <li key={c.id}>
                      <strong>{c.title}</strong>
                      <div className="text-sm opacity-70">
                        {c.excerpt}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
