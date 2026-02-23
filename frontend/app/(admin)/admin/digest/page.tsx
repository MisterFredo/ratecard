"use client";

import { useMemo, useState } from "react";
import DigestEngine from "@/components/digest/DigestEngine";
import DigestSelectors from "@/components/digest/DigestSelectors";
import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";
import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import ClientNewsletterPreview from "@/components/newsletter/ClientNewsletterPreview";
import { api } from "@/lib/api";
import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";
import type { SelectOption } from "@/components/ui/SearchableMultiSelect";

/* ========================================================= */

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

export default function DigestPage() {
  /* ==============================
     LOADING
  ============================== */

  const [loading, setLoading] = useState(false);

  /* ==============================
     DATA
  ============================== */

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  /* ==============================
     FILTER STATE (Multi)
  ============================== */

  const [selectedTopics, setSelectedTopics] =
    useState<SelectOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] =
    useState<SelectOption[]>([]);
  const [selectedTypes, setSelectedTypes] =
    useState<SelectOption[]>([]);

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

  async function handleSearch(filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
  }) {
    setLoading(true);

    try {
      const json = await api.post("/admin/digest/search", {
        ...filters,
        limit: 20,
      });

      setNews(json.news || []);
      setBreves(json.breves || []);
      setAnalyses(json.analyses || []);

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

      {/* =========================
          FILTER ENGINE (NEW)
      ========================= */}
      <DigestEngine
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        onSearch={handleSearch}
      />

      {/* =========================
          SELECTORS
      ========================= */}
      <DigestSelectors
        news={news}
        breves={breves}
        analyses={analyses}
        editorialOrder={editorialOrder}
        setEditorialOrder={setEditorialOrder}
      />

      {/* =========================
          EDITORIAL FLOW
      ========================= */}
      <DigestEditorialFlow
        editorialOrder={editorialOrder}
        news={news}
        breves={breves}
        analyses={analyses}
        setEditorialOrder={setEditorialOrder}
      />

      {/* =========================
          HEADER
      ========================= */}
      <DigestHeaderConfig
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfig}
      />

      {/* =========================
          INTRO
      ========================= */}
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

      {/* =========================
          PREVIEWS
      ========================= */}
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
