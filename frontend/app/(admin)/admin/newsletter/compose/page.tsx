"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import NewsletterSelector from "@/components/newsletter/NewsletterSelector";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type NewsItem = {
  id: string;
  title: string;
  excerpt?: string | null;
  visual_rect_url: string;
  published_at: string;
};

export type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
};

export default function NewsletterComposePage() {
  const [introText, setIntroText] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);

  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] = useState<string[]>([]);

  // -----------------------------------------------------
  // Fetch sources (same as Home / News / Analysis)
  // -----------------------------------------------------
  useEffect(() => {
    fetch(`${API_BASE}/news/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.news || []).map((n: any) => ({
          id: n.ID_NEWS,
          title: n.TITLE,
          excerpt: n.EXCERPT ?? null,
          visual_rect_url: n.VISUAL_RECT_URL,
          published_at: n.PUBLISHED_AT,
        }));
        setNews(mapped);
      });

    fetch(`${API_BASE}/public/analysis/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setAnalyses(json.items || []);
      });
  }, []);

  // -----------------------------------------------------
  // Selected objects (ordered)
  // -----------------------------------------------------
  const selectedNews = useMemo(
    () => news.filter((n) => selectedNewsIds.includes(n.id)),
    [news, selectedNewsIds]
  );

  const selectedAnalyses = useMemo(
    () => analyses.filter((a) => selectedAnalysisIds.includes(a.id)),
    [analyses, selectedAnalysisIds]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

      {/* LEFT — COMPOSITION */}
      <div className="space-y-8">
        <section className="space-y-3">
          <h1 className="text-lg font-semibold">Composer la newsletter</h1>
          <textarea
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="Texte introductif (optionnel, 4–5 lignes max)"
            className="w-full min-h-[120px] rounded-lg border border-gray-300 p-3 text-sm"
          />
        </section>

        <NewsletterSelector
          title="News partenaires"
          items={news}
          selectedIds={selectedNewsIds}
          onChange={setSelectedNewsIds}
          labelKey="title"
        />

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
        analyses={selectedAnalyses}
      />
    </div>
  );
}
