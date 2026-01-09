export const dynamic = "force-dynamic";

import NewsCard from "@/components/news/NewsCard";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  ID_NEWS: string;
  TITLE: string;
  VISUAL_RECT_URL: string;
  PUBLISHED_AT?: string | null;
};

/* =========================================================
   API
========================================================= */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   LOADER
========================================================= */

async function getNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/news/list`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.news || [];
  } catch {
    return [];
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="space-y-20">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          News
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Annonces et prises de parole des partenaires de l’écosystème Ratecard.
        </p>
      </section>

      {/* =====================================================
          LISTE DES NEWS
      ===================================================== */}
      {news.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune news publiée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => (
            <NewsCard
              key={n.ID_NEWS}
              id={n.ID_NEWS}
              title={n.TITLE}
              visualRectUrl={n.VISUAL_RECT_URL}
              publishedAt={n.PUBLISHED_AT || ""}
            />
          ))}
        </div>
      )}

    </div>
  );
}
