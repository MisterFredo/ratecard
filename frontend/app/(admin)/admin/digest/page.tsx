"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterSelector from "@/components/newsletter/NewsletterSelector";

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
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(false);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);

  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [selectedBriefIds, setSelectedBriefIds] = useState<string[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] =
    useState<string[]>([]);

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
    if (!selectedModelId || !dateFrom || !dateTo) return;

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
            topic_ids: model.topics,
            company_ids: model.companies,
            news_types: model.news_types,
            date_from: dateFrom,
            date_to: dateTo,
          }),
        }
      );

      const json = await res.json();

      const allNews: NewsItem[] = json.news || [];

      setNews(allNews);
      setAnalyses(json.analyses || []);

      setSelectedNewsIds([]);
      setSelectedBriefIds([]);
      setSelectedAnalysisIds([]);
    } finally {
      setLoading(false);
    }
  }

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">
          Digest
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

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

          <input
            type="date"
            value={dateFrom}
            onChange={(e) =>
              setDateFrom(e.target.value)
            }
            className="border rounded px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) =>
              setDateTo(e.target.value)
            }
            className="border rounded px-3 py-2 text-sm"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-black text-white text-sm rounded px-4 py-2"
          >
            {loading ? "Recherche…" : "Rechercher"}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        <NewsletterSelector
          title="News"
          items={newsItems}
          selectedIds={selectedNewsIds}
          onChange={setSelectedNewsIds}
          labelKey="title"
        />

        <NewsletterSelector
          title="Brèves"
          items={briefItems}
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

    </div>
  );
}
