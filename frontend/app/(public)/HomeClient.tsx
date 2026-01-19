"use client";

import { useState, useEffect } from "react";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

/* =========================================================
   TYPES
========================================================= */

type Company = {
  name: string;
  is_partner?: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url?: string | null;
  published_at: string;
  company?: Company;
};

type Props = {
  news: NewsItem[];
};

const PAGE_SIZE = 12;

/* =========================================================
   COMPONENT
========================================================= */

export default function HomeClient({ news }: Props) {
  /* ---------------------------------------------------------
     STATE — SCROLL INFINI
  --------------------------------------------------------- */
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedNews = [...news].sort(
    (a, b) =>
      new Date(b.published_at).getTime() -
      new Date(a.published_at).getTime()
  );

  const featuredNews = sortedNews[0];
  const otherNews = sortedNews.slice(1);
  const visibleNews = otherNews.slice(0, visibleCount);

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
    return () => window.removeEventListener("scroll", onScroll);
  }, [otherNews.length]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* =====================================================
          GRILLE NEWS — UNE x4 + FLUX CONTINU
      ===================================================== */}
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
            UNE — x4
        ================================================= */}
        {featuredNews && (
          <div className="lg:col-span-2 lg:row-span-2">
            <PartnerSignalCard
              id={featuredNews.id}
              title={featuredNews.title}
              excerpt={featuredNews.excerpt}
              visualRectUrl={featuredNews.visual_rect_url}
              companyName={featuredNews.company?.name}
              isPartner={featuredNews.company?.is_partner === true}
              publishedAt={featuredNews.published_at}
              openInDrawer
              variant="featured"
            />
          </div>
        )}

        {/* =================================================
            FLUX NEWS (SCROLL INFINI)
        ================================================= */}
        {visibleNews.map((n) => (
          <PartnerSignalCard
            key={n.id}
            id={n.id}
            title={n.title}
            excerpt={n.excerpt}
            visualRectUrl={n.visual_rect_url}
            companyName={n.company?.name}
            isPartner={n.company?.is_partner === true}
            publishedAt={n.published_at}
            openInDrawer
          />
        ))}
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

