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
    <div className="space-y-24">

      {/* =====================================================
          NEWS — ANNONCES PARTENAIRES
      ===================================================== */}
      <section className="space-y-8">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Dernières annonces du marché
          </h2>
          <p className="text-sm text-gray-500">
            Annonces et prises de parole des partenaires de l’écosystème.
          </p>
        </header>

        {news.length === 0 ? (
          <p className="text-sm text-gray-400">
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
          ANALYSES — ESPACES PAR ÉVÉNEMENT
      ===================================================== */}
      <section className="space-y-12">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Lectures Ratecard par événement
          </h2>
          <p className="text-sm text-gray-500">
            Analyses produites à partir des événements Ratecard.
          </p>
        </header>

        {events.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucun événement actif pour le moment.
          </p>
        ) : (
          <div className="space-y-10">
            {events.map((block) => (
              <div
                key={block.event.id}
                className="
                  rounded-2xl border border-ratecard-border
                  bg-white p-6
                "
              >
                {/* HEADER EVENT */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="inline-block w-1.5 h-8 rounded-full"
                    style={{
                      backgroundColor:
                        block.event.event_color || "#9CA3AF",
                    }}
                  />
                  <h3 className="font-semibold text-gray-900">
                    {block.event.home_label}
                  </h3>
                </div>

                {/* ANALYSES */}
                {block.analyses.length === 0 ? (
                  <p className="text-sm text-gray-400 pl-4">
                    Aucune analyse publiée pour le moment.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {block.analyses.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/analysis/${a.id}`}
                          className="
                            block pl-4 border-l border-ratecard-border
                            hover:border-gray-400 transition-colors
                          "
                        >
                          <p className="text-sm font-medium text-gray-900 hover:underline">
                            {a.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
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
