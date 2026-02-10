"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import NewsletterSelector from "@/components/newsletter/NewsletterSelector";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   TYPES
========================================================= */

export type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_id?: string | null;
  published_at: string;
  news_kind: "NEWS" | "BRIEF";
};

export type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function NewsletterComposePage() {
  const [introText, setIntroText] = useState("");

  const [news, setNews] = useState<NewsItem[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);

  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [selectedBriefIds, setSelectedBriefIds] = useState<string[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] =
    useState<string[]>([]);

  /* -----------------------------------------------------
     FETCH SOURCES
  ----------------------------------------------------- */
  useEffect(() => {
    // NEWS + BRÈVES
    fetch(`${API_BASE}/news/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const mapped: NewsItem[] = (json.news || []).map((n: any) => ({
          id: n.ID_NEWS,
          title: n.TITLE,
          excerpt: n.EXCERPT ?? null,
          visual_rect_id: n.VISUAL_RECT_ID ?? null,
          published_at: n.PUBLISHED_AT,
          news_kind: n.NEWS_KIND,
        }));

        setNews(mapped);
      });

    // ANALYSES
    fetch(`${API_BASE}/public/analysis/list`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((json) => {
        setAnalyses(json.items || []);
      });
  }, []);

  /* -----------------------------------------------------
     SPLIT NEWS / BRÈVES
  ----------------------------------------------------- */
  const newsItems = useMemo(
    () => news.filter((n) => n.news_kind === "NEWS"),
    [news]
  );

  const briefItems = useMemo(
    () => news.filter((n) => n.news_kind === "BRIEF"),
    [news]
  );

  /* -----------------------------------------------------
     SELECTED OBJECTS (ORDERED)
  ----------------------------------------------------- */
  const selectedNews = useMemo(
    () =>
      newsItems.filter((n) =>
        selectedNewsIds.includes(n.id)
      ),
    [newsItems, selectedNewsIds]
  );

  const selectedBriefes = useMemo(
    () =>
      briefItems.filter((b) =>
        selectedBriefIds.includes(b.id)
      ),
    [briefItems, selectedBriefIds]
  );

  const selectedAnalyses = useMemo(
    () =>
      analyses.filter((a) =>
        selectedAnalysisIds.includes(a.id)
      ),
    [analyses, selectedAnalysisIds]
  );

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      {/* LEFT — COMPOSITION */}
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-lg font-semibold">
            Composer la newsletter
          </h1>

          <textarea
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="Texte introductif (optionnel, 4–5 lignes max)"
            className="w-full min-h-[120px] rounded-lg border border-gray-300 p-3 text-sm"
          />
        </section>

        {/* NEWS */}
        <NewsletterSelector
          title="News partenaires"
          items={newsItems}
          selectedIds={selectedNewsIds}
          onChange={setSelectedNewsIds}
          labelKey="title"
        />

        {/* BRÈVES */}
        <NewsletterSelector
          title="Brèves"
          items={briefItems}
          selectedIds={selectedBriefIds}
          onChange={setSelectedBriefIds}
          labelKey="title"
        />

        {/* ANALYSES */}
        <NewsletterSelector
          title="Analyses Ratecard"
          items={analyses}
          selectedIds={selectedAnalysisIds}
          onChange={setSelectedAnalysisIds}
          labelKey="title"
        />
      </div>

      {/* RIGHT — PREVIEW */}
      <NewsletterPreview
        introText={introText}
        news={selectedNews}
        breves={selectedBriefes}
        analyses={selectedAnalyses}
      />
    </div>
  );
}

