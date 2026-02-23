"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

import DigestSidebar from "@/components/newsletter/DigestSidebar";
import DigestPreviewPanel from "@/components/newsletter/DigestPreviewPanel";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

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

/* =========================================================
   PAGE
========================================================= */

export default function DigestPage() {
  /* -----------------------------
     MODELS (optionnel / presets)
  ----------------------------- */
  const [models, setModels] = useState<DigestModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");

  /* -----------------------------
     LOADING
  ----------------------------- */
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* -----------------------------
     DATA
  ----------------------------- */
  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  /* -----------------------------
     SELECTION
  ----------------------------- */
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>([]);
  const [selectedBriefIds, setSelectedBriefIds] = useState<string[]>([]);
  const [selectedAnalysisIds, setSelectedAnalysisIds] =
    useState<string[]>([]);

  const [introText, setIntroText] = useState("");

  /* =========================================================
     LOAD MODELS (OPTIONAL PRESETS)
  ========================================================= */

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await api.get("/admin/digest/template");
        setModels(data || []);
      } catch (e) {
        console.error("Erreur chargement modèles", e);
      }
    }

    loadTemplates();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  async function handleSearch() {
    setLoading(true);

    try {
      const model = models.find(
        (m) => m.id_template === selectedModelId
      );

      const topics = model?.topics ?? undefined;
      const companies = model?.companies ?? undefined;
      const news_types = model?.news_types ?? undefined;

      const json = await api.post("/admin/digest/search", {
        topics,
        companies,
        news_types,
        limit: 20,
      });

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
    } catch (e) {
      console.error("Erreur search digest", e);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD MORE
  ========================================================= */

  async function handleLoadMore() {
    if (!cursor) return;

    const model = models.find(
      (m) => m.id_template === selectedModelId
    );

    const topics = model?.topics ?? undefined;
    const companies = model?.companies ?? undefined;
    const news_types = model?.news_types ?? undefined;

    setLoadingMore(true);

    try {
      const json = await api.post("/admin/digest/search", {
        topics,
        companies,
        news_types,
        limit: 20,
        cursor,
      });

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

      setHasMore(
        newNews.length === 20 || newBreves.length === 20
      );
    } catch (e) {
      console.error("Erreur load more", e);
    } finally {
      setLoadingMore(false);
    }
  }

  /* =========================================================
     DERIVED SELECTED ITEMS
  ========================================================= */

  const selectedNews = useMemo(
    () => news.filter((n) => selectedNewsIds.includes(n.id)),
    [news, selectedNewsIds]
  );

  const selectedBriefs = useMemo(
    () => breves.filter((b) => selectedBriefIds.includes(b.id)),
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
     LAYOUT
  ========================================================= */

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="grid grid-cols-[420px_1fr] h-full gap-8">

        <DigestSidebar
          models={models}
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          onSearch={handleSearch}
          loading={loading}

          news={news}
          breves={breves}
          analyses={analyses}

          selectedNewsIds={selectedNewsIds}
          setSelectedNewsIds={setSelectedNewsIds}
          selectedBriefIds={selectedBriefIds}
          setSelectedBriefIds={setSelectedBriefIds}
          selectedAnalysisIds={selectedAnalysisIds}
          setSelectedAnalysisIds={setSelectedAnalysisIds}

          introText={introText}
          setIntroText={setIntroText}

          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
        />

        <DigestPreviewPanel
          introText={introText}
          news={selectedNews}
          breves={selectedBriefs}
          analyses={selectedAnalyses}
        />

      </div>
    </div>
  );
}
