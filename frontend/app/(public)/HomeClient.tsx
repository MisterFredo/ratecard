"use client";

import { useState, useEffect } from "react";
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
  const { openRightDrawer } = useDrawer();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ---------------------------------------------------------
     1. TOP 6 — NEWS UNIQUEMENT
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
     2. FLUX GLOBAL (NEWS / BRIEF / ANALYSIS)
     - on enlève les NEWS déjà utilisées en top
     - on trie par date
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
     SCROLL
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
      <section
        className="
          grid grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
          auto-rows-[340px]
        "
      >
        {/* =================================================
            TOP 6 — NEWS ONLY
        ================================================= */}
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

        {/* =================================================
            FLUX CHRONO MIXTE
        ================================================= */}
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

      {visibleCount < MAX_ITEMS && (
        <div className="py-10 text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}
    </div>
  );
}
