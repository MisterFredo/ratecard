"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";
import PartnerSignalCard from "@/components/news/PartnerSignalCard";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type NewsItem = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  VISUAL_RECT_URL: string;
  PUBLISHED_AT?: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   FETCH
========================================================= */

async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(
    `${API_BASE}/news/list`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.news || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { openDrawer } = useDrawer();

  useEffect(() => {
    fetchNews().then(setNews);
  }, []);

  return (
    <div className="space-y-20">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          News
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Annonces et prises de parole des partenaires de l’écosystème Ratecard.
        </p>
      </section>

      {/* =====================================================
          LISTE DES NEWS — DRAWER ADEX-LIKE
      ===================================================== */}
      {news.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune news publiée pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((n) => (
            <PartnerSignalCard
              key={n.ID_NEWS}
              id={n.ID_NEWS}
              title={n.TITLE}
              excerpt={n.EXCERPT}
              visualRectUrl={n.VISUAL_RECT_URL}
              publishedAt={n.PUBLISHED_AT || ""}
              openInDrawer   // ⬅️ COMPORTEMENT ADEX
            />
          ))}
        </div>
      )}

    </div>
  );
}
