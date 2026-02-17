"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import BriefCard from "@/components/news/BriefCard";
import AnalysisTeaserCard from "@/components/analysis/AnalysisTeaserCard";
import { useDrawer } from "@/contexts/DrawerContext";

/* =========================================================
   TYPES
========================================================= */

type Company = {
  name: string;
  is_partner?: boolean;
  media_logo_rectangle_id?: string | null;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_id?: string | null;
  published_at: string;

  news_kind: "NEWS" | "BRIEF";

  company?: Company;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
};

type UnifiedItem =
  | { type: "NEWS"; published_at: string; item: NewsItem }
  | { type: "BRIEF"; published_at: string; item: NewsItem }
  | { type: "ANALYSIS"; published_at: string; item: AnalysisItem };

type Props = {
  news: NewsItem[];
  analyses?: AnalysisItem[];
};

/* =========================================================
   CONFIG
========================================================= */

const PAGE_SIZE = 12;
const MAX_ITEMS = 100;
const TOP_NEWS_COUNT = 6;

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({
  news,
  analyses = [],
}: Props) {
  const router = useRouter();
  const { openRightDrawer } = useDrawer();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ---------------------------------------------------------
     TOP 6 — NEWS UNIQUEMENT
  --------------------------------------------------------- */
  const topNews = [...news]
    .filter((n) => n.news_kind === "NEWS")
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, TOP_NEWS_COUNT);

  const topNewsIds = new Set(topNews.map((n) => n.id));

  /* ---------------------------------------------------------
     FLUX GLOBAL CHRONO
  --------------------------------------------------------- */
  const unifiedItems: UnifiedItem[] = [
    ...news
      .filter((n) => !topNewsIds.has(n.id))
      .map((n) => ({
        type: n.news_kind,
        published_at: n.published_at,
        item: n,
      })),
    ...analyses.map((a) => ({
      type: "ANALYSIS" as const,
      published_at: a.published_at,
      item: a,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, Math.min(visibleCount, MAX_ITEMS));

  /* ---------------------------------------------------------
     SCROLL HANDLER
  --------------------------------------------------------- */
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, MAX_ITEMS)
        );
      }
    }

    window.addEventListener("scroll", onScroll);
    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* =================================================
          GRID
      ================================================= */}
      <section
        className="
          grid grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
          auto-rows-[340px]
        "
      >
        {/* TOP 6 — NEWS */}
        {topNews.map((n, idx) => (
          <div
            key={`top-news-${n.id}`}
            className={
              idx === 0
                ? "lg:col-span-2 lg:row-span-2"
                : undefined
            }
          >
            <PartnerSignalCard
              id={n.id}
              title={n.title}
              excerpt={n.excerpt}
              visualRectId={n.visual_rect_id}
              companyVisualRectId={
                n.company?.media_logo_rectangle_id
              }
              companyName={n.company?.name}
              isPartner={n.company?.is_partner === true}
              publishedAt={n.published_at}
              openInDrawer
              variant={idx === 0 ? "featured" : undefined}
            />
          </div>
        ))}

        {/* FLUX MIXTE */}
        {unifiedItems.map((entry, idx) => {
          if (entry.type === "NEWS") {
            const n = entry.item;

            return (
              <PartnerSignalCard
                key={`news-${n.id}-${idx}`}
                id={n.id}
                title={n.title}
                excerpt={n.excerpt}
                visualRectId={n.visual_rect_id}
                companyVisualRectId={
                  n.company?.media_logo_rectangle_id
                }
                companyName={n.company?.name}
                isPartner={
                  n.company?.is_partner === true
                }
                publishedAt={n.published_at}
                openInDrawer
              />
            );
          }

          if (entry.type === "BRIEF") {
            const b = entry.item;

            return (
              <BriefCard
                key={`brief-${b.id}-${idx}`}
                id={b.id}
                title={b.title}
                excerpt={b.excerpt ?? ""}
                publishedAt={b.published_at}
                onClick={() => router.push("/breves")}
              />
            );
          }

          const a = entry.item;

          return (
            <AnalysisTeaserCard
              key={`analysis-${a.id}-${idx}`}
              id={a.id}
              title={a.title}
              excerpt={a.excerpt}
              publishedAt={a.published_at}
              topic={a.topics?.[0]}
              mode="test"
              onOpenTest={(id) =>
                openRightDrawer("analysis", id)
              }
            />
          );
        })}
      </section>

      {/* =====================================================
          NEWSLETTER CTA
      ===================================================== */}
      <section className="mt-20 mb-16">
        <div className="border border-gray-200 rounded-2xl bg-white px-8 py-12 text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
            Newsletter
          </p>

          <h3 className="text-xl font-medium text-gray-900 mb-3">
            La lecture du marché, une fois par semaine.
          </h3>

          <p className="text-sm text-gray-500 mb-6 max-w-xl mx-auto">
            Signaux partenaires, analyses stratégiques et synthèse
            de l’écosystème Retail Media & AdTech.
          </p>

          <button
            onClick={() => router.push("/newsletter")}
            className="
              px-6 py-2.5
              rounded-full
              bg-ratecard-blue
              text-white
              text-sm
              hover:opacity-90
              transition
            "
          >
            S’inscrire
          </button>
        </div>
      </section>

      {/* =====================================================
          FIN DE FLUX
      ===================================================== */}
      {visibleCount < MAX_ITEMS && (
        <div className="py-10 text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}
    </div>
  );
}
