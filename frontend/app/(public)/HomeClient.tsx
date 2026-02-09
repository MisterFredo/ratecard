"use client";

import { useState, useEffect } from "react";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";
import AnalysisTeaserCard from "@/components/analysis/AnalysisTeaserCard";
import BriefCard from "@/components/news/BriefCard";
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

  // 🔑 distingue news “riche” vs brève
  kind?: "news" | "brief";
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

const PAGE_SIZE = 12;
const ANALYSIS_INSERT_INDEX = 5;

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({
  news,
  analyses = [],
}: Props) {
  const { openRightDrawer } = useDrawer();

  /* ---------------------------------------------------------
     STATE — SCROLL INFINI
  --------------------------------------------------------- */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ---------------------------------------------------------
     TRI PAR DATE
  --------------------------------------------------------- */
  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const featuredNews = sortedNews.find(
    (n) => n.kind !== "brief"
  );

  const otherNews = sortedNews.filter(
    (n) => n.id !== featuredNews?.id
  );

  const visibleNews = otherNews.slice(0, visibleCount);

  /* ---------------------------------------------------------
     CONSTRUCTION DU FLUX MIXTE
  --------------------------------------------------------- */
  const mixedItems: Array<
    | { type: "news"; item: NewsItem }
    | { type: "brief"; item: NewsItem }
    | { type: "analysis"; item: AnalysisItem }
  > = [];

  visibleNews.forEach((n, index) => {
    if (n.kind === "brief") {
      mixedItems.push({ type: "brief", item: n });
    } else {
      mixedItems.push({ type: "news", item: n });
    }

    if (
      index === ANALYSIS_INSERT_INDEX &&
      analyses.length > 0
    ) {
      mixedItems.push({
        type: "analysis",
        item: analyses[0],
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
          Math.min(prev + PAGE_SIZE, otherNews.length)
        );
      }
    }

    window.addEventListener("scroll", onScroll);
    return () =>
      window.removeEventListener("scroll", onScroll);
  }, [otherNews.length]);

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
            UNE — NEWS RICHE UNIQUEMENT
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
                title={b.title}
                excerpt={b.excerpt}
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
      {visibleCount < otherNews.length && (
        <div className="py-10 text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}
    </div>
  );
}
