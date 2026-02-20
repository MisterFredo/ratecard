"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterSelector from "@/components/newsletter/NewsletterSelector";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import ClientNewsletterPreview from "@/components/newsletter/ClientNewsletterPreview";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* =========================================================
   TYPES
========================================================= */

type DigestModel = {
  id_template: string;
  name: string;
  topics: string[];
  companies: string[];
  news_types: string[];
};

type NewsItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at?: string;
  news_kind: "NEWS" | "BRIEF";
  visual_rect_id?: string;
};

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function DigestPage() {
  const [models, setModels] = useState<DigestModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [breves, setBreves] = useState<NewsItem[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [selectedBriefIds, setSelectedBriefIds] = useState<string[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] =
    useState<string[]>([]);

  const [introText, setIntroText] = useState("");

  /* -----------------------------------------------------
     LOAD MODELS
  ----------------------------------------------------- */
  useEffect(() => {
    fetch(`${API_BASE}/admin/digest/template`)
      .then((r) => r.json())
      .then((data) => {
        setModels(data || []);
      });
  }, []);

  /* -----------------------------------------------------
     SEARCH
  ----------------------------------------------------- */
  async function handleSearch() {
    if (!selectedModelId) return;

    const model = models.find(
      (m) => m.id_template === selectedModelId
    );
    if (!model) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/admin/digest/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: model.topics,
            companies: model.companies,
            news_types: model.news_types,
            limit: 20,
          }),
        }
      );

      const json = await res.json();

      setNews(json.news || []);
      setBreves(json.breves || []);
      setAnalyses(json.analyses || []);

      const lastDate =
        json.news?.at(-1)?.published_at ||
        json.breves?.at(-1)?.published_at ||
        null;

      setCursor(lastDate);
      setHasMore(
        (json.news?.length || 0) === 20 ||
        (json.breves?.length || 0) === 20
      );

      setSelectedNewsIds([]);
      setSelectedBriefIds([]);
      setSelectedAnalysisIds([]);
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------------------------------
     LOAD MORE
  ----------------------------------------------------- */
  async function handleLoadMore() {
    if (!cursor || !selectedModelId) return;

    const model = models.find(
      (m) => m.id_template === selectedModelId
    );
    if (!model) return;

    setLoadingMore(true);

    try {
      const res = await fetch(
        `${API_BASE}/admin/digest/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: model.topics,
            companies: model.companies,
            news_types: model.news_types,
            limit: 20,
            cursor,
          }),
        }
      );

      const json = await res.json();

      const newNews = json.news || [];
      const newBreves = json.breves || [];
      const newAnalyses = json.analyses || [];

      setNews((prev) => [...prev, ...newNews]);
      setBreves((prev) => [...prev, ...newBreves]);
      setAnalyses((prev) => [...prev, ...newAnalyses]);

      const lastDate =
        newNews.at(-1)?.published_at ||
        newBreves.at(-1)?.published_at ||
        null;

      setCursor(lastDate);
      setHasMore(newNews.length === 20 || newBreves.length === 20);
    } finally {
      setLoadingMore(false);
    }
  }

  /* -----------------------------------------------------
     SELECTED ITEMS
  ----------------------------------------------------- */
  const selectedNews = useMemo(
    () => news.filter((n) => selectedNewsIds.includes(n.id)),
    [news, selectedNewsIds]
  );

  const selectedBriefs = useMemo(
    () => breves.filter((n) => selectedBriefIds.includes(n.id)),
    [breves, selectedBriefIds]
  );

  const selectedAnalyses = useMemo(
    () =>
      analyses.filter((a) =>
        selectedAnalysisIds.includes(a.id)
      ),
    [analyses, selectedAnalysisIds]
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">
          Digest
        </h1>

        <div className="flex gap-4">

          <select
            value={selectedModelId}
            onChange={(e) =>
              setSelectedModelId(e.target.value)
            }
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Choisir un modèle</option>
            {models.map((m) => (
              <option
                key={m.id_template}
                value={m.id_template}
              >
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white text-sm rounded px-4 py-2"
          >
            {loading ? "Recherche…" : "Rechercher"}
          </button>

        </div>
      </div>

      {/* SELECTORS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        <NewsletterSelector
          title="News"
          items={news}
          selectedIds={selectedNewsIds}
          onChange={setSelectedNewsIds}
          labelKey="title"
        />

        <NewsletterSelector
          title="Brèves"
          items={breves}
          selectedIds={selectedBriefIds}
          onChange={setSelectedBriefIds}
          labelKey="title"
        />

        <NewsletterSelector
          title="Analyses"
          items={analyses}
          selectedIds={selectedAnalysisIds}
          onChange={setSelectedAnalysisIds}
          labelKey="title"
        />

      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 border rounded text-sm"
          >
            {loadingMore
              ? "Chargement…"
              : "Charger plus"}
          </button>
        </div>
      )}

      {/* INTRO */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">
          Introduction
        </h2>
        <textarea
          className="w-full border rounded p-3 min-h-[120px]"
          value={introText}
          onChange={(e) =>
            setIntroText(e.target.value)
          }
          placeholder="Introduction de la newsletter..."
        />
      </div>

      {/* PREVIEW */}
      <NewsletterPreview
        introText={introText}
        news={selectedNews}
        breves={selectedBriefs}
        analyses={selectedAnalyses}
      />

    </div>
  );
}
