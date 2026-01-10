"use client";

import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url: string;
  published_at: string;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
  event: {
    id: string;
    home_label: string;
    event_color?: string;
  };
};

type Props = {
  news: NewsItem[];
  analyses: AnalysisItem[]; // 👈 analyses déjà plates côté API
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({ news, analyses }: Props) {
  const { openDrawer } = useDrawer();

  // -------------------------------------------------------
  // 12 DERNIÈRES ANALYSES (TRI CHRONO)
  // -------------------------------------------------------
  const latestAnalyses = analyses
    .slice()
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 12);

  return (
    <div className="space-y-16">

      {/* =====================================================
          NEWS — PARTNER SIGNALS (INCHANGÉ)
      ===================================================== */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {news.map((n) => (
            <PartnerSignalCard
              key={n.id}
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectUrl={n.visual_rect_url}
              publishedAt={n.published_at}
              openInDrawer
            />
          ))}
        </div>
      </section>

      {/* =====================================================
          ANALYSES — CARTES MÉLANGÉES
      ===================================================== */}
      <section className="space-y-6">
        <div
          className="
            grid grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {latestAnalyses.map((a) => (
            <article
              key={a.id}
              onClick={() => openDrawer("analysis", a.id)}
              className="
                cursor-pointer rounded-2xl
                border border-ratecard-border bg-white
                p-5 hover:border-gray-400 transition-colors
                flex flex-col
              "
            >
              {/* EVENT LABEL */}
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      a.event.event_color || "#9CA3AF",
                  }}
                />
                <span className="font-medium">
                  {a.event.home_label}
                </span>
              </div>

              {/* TITLE */}
              <h3 className="text-base font-semibold text-gray-900 leading-snug">
                {a.title}
              </h3>

              {/* EXCERPT */}
              {a.excerpt && (
                <p className="text-sm text-gray-600 mt-2">
                  {a.excerpt}
                </p>
              )}

              {/* META */}
              <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {a.topics?.[0] && (
                  <span className="px-2 py-0.5 rounded bg-ratecard-light text-gray-600">
                    {a.topics[0]}
                  </span>
                )}

                {a.key_metrics?.[0] && (
                  <span>• {a.key_metrics[0]}</span>
                )}

                <span className="text-gray-400">
                  {new Date(
                    a.published_at
                  ).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

