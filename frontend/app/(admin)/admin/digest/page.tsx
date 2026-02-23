"use client";

import { useEffect, useMemo, useState } from "react";
import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import DigestSearchBar from "@/components/digest/DigestSearchBar";
import DigestSelectors from "@/components/digest/DigestSelectors";
import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";
import DigestIntroBlock from "@/components/digest/DigestIntroBlock";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import ClientNewsletterPreview from "@/components/newsletter/ClientNewsletterPreview";
import { api } from "@/lib/api";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* ========================================================= */

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

export default function DigestPage() {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  /* ==============================
     FILTER STATE
  ============================== */

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "NEWS",
    "BRIEF",
    "ANALYSIS",
  ]);

  /* ==============================
     HEADER CONFIG
  ============================== */

  const [headerConfig, setHeaderConfig] = useState({
    title: "Newsletter Ratecard",
    subtitle: "",
    imageUrl: "",
    mode: "ratecard" as "ratecard" | "client",
  });

  const [introText, setIntroText] = useState("");
  const [editorialOrder, setEditorialOrder] =
    useState<EditorialItem[]>([]);

  /* =========================================================
     SEARCH
  ========================================================= */

  async function handleSearch() {
    setLoading(true);

    try {
      const json = await api.post("/admin/digest/search", {
        topics: selectedTopics,
        companies: selectedCompanies,
        news_types: selectedTypes,
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

      setEditorialOrder([]);
    } catch (e) {
      console.error("Erreur search digest", e);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     MAP EDITORIAL FLOW
  ========================================================= */

  const editorialNews = editorialOrder
    .filter((i) => i.type === "news")
    .map((i) => news.find((n) => n.id === i.id))
    .filter(Boolean) as NewsletterNewsItem[];

  const editorialBreves = editorialOrder
    .filter((i) => i.type === "breve")
    .map((i) => breves.find((b) => b.id === i.id))
    .filter(Boolean) as NewsletterNewsItem[];

  const editorialAnalyses = editorialOrder
    .filter((i) => i.type === "analysis")
    .map((i) => analyses.find((a) => a.id === i.id))
    .filter(Boolean) as NewsletterAnalysisItem[];

  /* ========================================================= */

  return (
    <div className="space-y-12">

      <h1 className="text-lg font-semibold">
        Digest
      </h1>

      {/* FILTER ENGINE */}
      <DigestFilters
        topics={[]}          {/* À connecter à ton référentiel */}
        companies={[]}       {/* idem */}
        types={["NEWS", "BRIEF", "ANALYSIS"]}
        selectedTopics={selectedTopics}
        selectedCompanies={selectedCompanies}
        selectedTypes={selectedTypes}
        onChangeTopics={setSelectedTopics}
        onChangeCompanies={setSelectedCompanies}
        onChangeTypes={setSelectedTypes}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* SELECTORS */}
      <DigestSelectors
        news={news}
        breves={breves}
        analyses={analyses}
        editorialOrder={editorialOrder}
        setEditorialOrder={setEditorialOrder}
      />

      {/* EDITORIAL FLOW */}
      <DigestEditorialFlow
        editorialOrder={editorialOrder}
        news={news}
        breves={breves}
        analyses={analyses}
        setEditorialOrder={setEditorialOrder}
      />

      {/* HEADER */}
      <DigestHeaderConfig
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfig}
      />

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
        />
      </div>

      {/* PREVIEWS */}
      <NewsletterPreview
        headerConfig={headerConfig}
        introText={introText}
        news={editorialNews}
        breves={editorialBreves}
        analyses={editorialAnalyses}
      />

      <ClientNewsletterPreview
        headerConfig={headerConfig}
        introText={introText}
        news={editorialNews}
        breves={editorialBreves}
        analyses={editorialAnalyses}
      />
    </div>
  );
}
