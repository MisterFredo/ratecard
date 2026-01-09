"use client";

import NewsCard from "@/components/news/NewsCard";
import Link from "next/link";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  id: string;
  title: string;
  visual_rect_url: string;
  published_at: string;
};

type AnalysisLine = {
  id: string;
  title: string;
  published_at: string;
};

type EventBlock = {
  event: {
    id: string;
    label: string;
    home_label: string;
    event_color?: string | null;
  };
  analyses: AnalysisLine[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({
  news,
  events,
}: {
  news: NewsItem[];
  events: EventBlock[];
}) {
  return (
    <div className="space-y-20">

      {/* =====================================================
          NEWS — CARTES
      ===================================================== */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">
          Dernières annonces du marché
        </h2>

        {news.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune news publiée pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((n) => (
              <NewsCard
                key={n.id}
                id={n.id}
                title={n.title}
                visualRectUrl={n.visual_rect_url}
                publishedAt={n.published_at}
              />
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          ANALYSES — WORKFLOW PAR ÉVÉNEMENT
      ===================================================== */}
      <section className="space-y-10">
        <h2 className="text-lg font-semibold">
          Lectures Ratecard par événement
        </h2>

        {events.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun événement actif pour le moment.
          </p>
        ) : (
          <div className="space-y-12">
            {events.map((block) => (
              <div
                key={block.event.id}
                className="space-y-4"
              >
                {/* HEADER EVENT */}
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        block.event.event_color || "#9ca3af",
                    }}
                  />
                  <h3 className="font-medium">
                    {block.event.home_label}
                  </h3>
                </div>

                {/* ANALYSES */}
                {block.analyses.length === 0 ? (
                  <p className="text-sm text-gray-400 pl-6">
                    Aucune analyse publiée pour le moment.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {block.analyses.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/analysis/${a.id}`}
                          className="block pl-6 border-l border-gray-200 hover:border-gray-400 transition-colors"
                        >
                          <p className="text-sm font-medium hover:underline">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(
                              a.published_at
                            ).toLocaleDateString("fr-FR")}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
