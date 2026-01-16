"use client";

import Link from "next/link";
import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import AnalysisCard from "@/components/analysis/AnalysisCard";

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
    label: string;
    home_label?: string;
    event_color?: string;
  };
};

type Props = {
  news: NewsItem[];
  analyses: AnalysisItem[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({ news, analyses }: Props) {
  const { openRightDrawer } = useDrawer();

  // ---------------------------------------------------------
  // 9 DERNIÈRES NEWS (3 x 3)
  // ---------------------------------------------------------
  const latestNews = news
    .slice()
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 9);

  // ---------------------------------------------------------
  // 12 DERNIÈRES ANALYSES (TRI CHRONO)
  // ---------------------------------------------------------
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
          NEWS — 3 LIGNES DE 3
      ===================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Toutes les actualités de nos partenaires
          </h2>
          <Link
            href="/news"
            className="text-sm text-gray-500 hover:underline"
          >
            Voir toutes les news
          </Link>
        </div>

        <div
          className="
            grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4 md:gap-6
          "
        >
          {latestNews.map((n) => (
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
          ANALYSES
      ===================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Toutes les analyses AdTech, Agentique, Retail Media & Internationales
          </h2>
          <Link
            href="/analysis"
            className="text-sm text-gray-500 hover:underline"
          >
            Voir toutes les analyses
          </Link>
        </div>

        <div
          className="
            grid grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {latestAnalyses.map((a) => (
            <AnalysisCard
              key={a.id}
              id={a.id}
              title={a.title}
              excerpt={a.excerpt}
              publishedAt={a.published_at}
              event={{
                label: a.event.label,
                homeLabel: a.event.home_label,
                color: a.event.event_color,
              }}
              keyMetric={a.key_metrics?.[0]}
              topic={a.topics?.[0]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
