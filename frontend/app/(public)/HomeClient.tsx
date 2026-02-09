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
  company?: Company;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
};

type Props = {
  news: NewsItem[];
  analyses?: AnalysisItem[];
};

/* =========================================================
   CONFIG
========================================================= */

const PAGE_SIZE = 12;
const MAX_ITEMS = 100;

const BRIEF_START_INDEX = 6;   // à partir de la 7e carte
const ANALYSIS_INSERT_INDEX = 10;

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({
  news,
  analyses = [],
}: Props) {
  const { openRightDrawer } = useDrawer();

  /* ---------------------------------------------------------
     STATE — SCROLL
  --------------------------------------------------------- */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ---------------------------------------------------------
     TRI DES NEWS (DATE DESC)
  --------------------------------------------------------- */
  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const featuredNews = sortedNews[0];
  const otherNews = sortedNews.slice(1);

  const visibleNews = otherNews.slice(
    0,
    Math.min(visibleCount, MAX_ITEMS)
  );

  /* ---------------------------------------------------------
     CONSTRUCTION DU FLUX
  --------------------------------------------------------- */
  const mixedItems: Array<
    | { type: "news"; item: NewsItem }
    | { type: "brief"; item: NewsItem }
    | { type: "analysis"; item: AnalysisItem }
  > = [];

  visibleNews.forEach((n, index) => {
    if (index < BRIEF_START_INDEX) {
      mixedItems.push({ type: "news", item: n });
    } else {
      mixedItems.push({ type: "brief", item: n });
    }

    if (
      index === ANALYSIS_INSERT_INDEX &&
      analyses.length > 0
    ) {
      mixedItems.push({
        type: "analysis",
        item: analyses[0], // V1 volontaire
      });
    }
  });

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
            UNE — NEWS FEATURED
        ================================================= */}
        {featuredNews && (
          <div className="lg:col-span-2 lg:row-span-2">
            <PartnerSignalCard
              id={featuredNews.id}
              title={featuredNews.title}
              excerpt={featuredNews.excerpt}
              visualRectId={featuredNews.visual_rect_id}
              companyVisualRectId={
                featuredNews.company?.media_logo_rectangle_id
              }
              companyName={featuredNews.company?.name}
              isPartner={
                featuredNews.company?.is_partner === true
              }
              publishedAt={featuredNews.published_at}
              openInDrawer
              variant="featured"
            />
          </div>
        )}

        {/* =================================================
            FLUX MIXTE
        ================================================= */}
        {mixedItems.map((entry, idx) => {
          if (entry.type === "news") {
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

          if (entry.type === "brief") {
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
              key={`analysis-${a.id}`}
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

