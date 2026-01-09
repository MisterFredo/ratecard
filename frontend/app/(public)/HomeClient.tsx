"use client";

import NewsCard from "@/components/news/NewsCard";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";
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
  topics?: string[];
  key_metrics?: string[];
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
    <div className="space-y-14 md:space-y-16">

      {/* =====================================================
          NEWS — PARTENAIRES
      ===================================================== */}
      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Dernières annonces du marché
          </h2>
          <p className="text-sm text-gray-500">
            Annonces et prises de parole des partenaires de l’écosystème.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {news.map((n) => (
            <PartnerSignalCard
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectUrl={n.visual_rect_url}
              publishedAt={n.published_at}
            /
          ))}
        </div>
      </section>

      {/* =====================================================
          ANALYSES — PAR ÉVÉNEMENT
      ===================================================== */}
      <section className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Lectures Ratecard par événement
          </h2>
          <p className="text-sm text-gray-500">
            Analyses produites à partir des événements Ratecard.
          </p>
        </header>

        <div className="space-y-8">
          {events.map((block) => (
            <div
              key={block.event.id}
              className="
                grid grid-cols-1 lg:grid-cols-3 gap-6
                rounded-2xl border border-ratecard-border
                bg-white p-4 md:p-5
              "
            >
              {/* COLONNE GAUCHE — ANALYSES */}
              <div className="lg:col-span-2 relative">
                <span
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
                  style={{
                    backgroundColor:
                      block.event.event_color || "#9CA3AF",
                  }}
                />

                <div className="pl-4 max-w-3xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          block.event.event_color || "#9CA3AF",
                      }}
                    />
                    <h3 className="font-semibold text-gray-900">
                      {block.event.home_label}
                    </h3>
                  </div>

                  <ul className="space-y-3">
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

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {a.topics?.map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2 py-0.5 rounded bg-ratecard-light text-gray-600"
                              >
                                {t}
                              </span>
                            ))}

                            {a.key_metrics?.map((m, i) => (
                              <span
                                key={i}
                                className="text-xs text-gray-500"
                              >
                                • {m}
                              </span>
                            ))}

                            <span className="text-xs text-gray-400">
                              {new Date(
                                a.published_at
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* COLONNE DROITE — CONTEXTE (VIDE POUR L’INSTANT) */}
              <aside className="hidden lg:block text-sm text-gray-400">
                {/* réservé pour évolutions futures */}
              </aside>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
