"use client";

import { useMemo, useState, useEffect } from "react";
import DigestEngine from "@/components/digest/DigestEngine";
import DigestSelectors from "@/components/digest/DigestSelectors";
import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";
import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import DigestPreviewPanel from "@/components/digest/DigestPreviewPanel";
import DigestTopicStats from "@/components/digest/DigestTopicStats";
import { api } from "@/lib/api";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

import type { SelectOption } from "@/components/ui/SearchableMultiSelect";

/* ========================================================= */

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis" | "number";
};

/* ========================================================= */

export default function DigestPage() {
  const [loading, setLoading] = useState(false);

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] = useState<NewsletterAnalysisItem[]>([]);
  const [numbers, setNumbers] = useState<NewsletterNumberItem[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<SelectOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<SelectOption[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SelectOption[]>([]);

  /* =========================================================
     🔥 STORE GLOBAL DES ITEMS
  ========================================================= */

  const [selectedItemsMap, setSelectedItemsMap] = useState<{
    [id: string]: any;
  }>({});

  function storeItems(items: any[]) {
    setSelectedItemsMap((prev) => {
      const next = { ...prev };
      items.forEach((i) => {
        if (i?.id) next[i.id] = i;
      });
      return next;
    });
  }

  /* =========================================================
     HEADER CONFIG
  ========================================================= */

  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: "Newsletter Ratecard",
    subtitle: "",
    period: "",
    headerCompany: undefined,
    showTopicStats: false,
    topBarEnabled: true,
    topBarColor: "#84CC16",
    periodColor: "#84CC16",
    introHtml: "",
  });

  const [introText, setIntroText] = useState("");

  const [editorialOrder, setEditorialOrder] = useState<EditorialItem[]>([]);

  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);

  /* =========================================================
     🔥 TEMPLATES
  ========================================================= */

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await api.get("/admin/digest/template");
        setTemplates(res.templates || []);
      } catch (e) {
        console.error("Erreur templates", e);
      }
    }

    loadTemplates();
  }, []);

  async function applyTemplate(templateId: string) {
    if (!templateId) return;

    setLoading(true);

    try {
      const res = await api.post("/admin/digest/template/apply", {
        template_id: templateId,
      });

      const data = res.result || res;

      /* 🔥 hydrate DATA */
      setNews(data.news || []);
      setBreves(data.breves || []);
      setAnalyses(data.analyses || []);
      setNumbers(data.numbers || []);

      storeItems([
        ...(data.news || []),
        ...(data.breves || []),
        ...(data.analyses || []),
        ...(data.numbers || []),
      ]);

      /* 🔥 hydrate EDITO */
      setEditorialOrder(data.editorial_order || []);
      setHeaderConfig(data.header_config || {});
      setIntroText(data.intro_text || "");

      /* 🔥 hydrate FILTERS (UI) */
      setSelectedTopics(
        (data.topics || []).map((id: string) => ({ id, label: id }))
      );
      setSelectedCompanies(
        (data.companies || []).map((id: string) => ({ id, label: id }))
      );
      setSelectedTypes(
        (data.news_types || []).map((id: string) => ({ id, label: id }))
      );

    } catch (e) {
      console.error("Erreur apply template", e);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD STATS
  ========================================================= */

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/news/breves/stats");

        const data = res.result || res;

        const topics: TopicStat[] = (data.topics_stats || [])
          .map((t: any) => ({
            label: t.label,
            last_30_days: t.last_30_days ?? 0,
            total: t.total ?? 0,
          }))
          .sort((a, b) => b.last_30_days - a.last_30_days);

        setTopicStats(topics);
      } catch (e) {
        console.error("Erreur chargement baromètre", e);
      }
    }

    loadStats();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  async function handleSearch(filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
    period: "total" | "30d" | "7d";
  }) {
    setLoading(true);

    try {
      const json = await api.post("/admin/digest/search", {
        ...filters,
        limit: 20,
      });

      const data = json.result || json || {};

      setNews(data.news || []);
      setBreves(data.breves || []);
      setAnalyses(data.analyses || []);
      setNumbers(data.numbers || []);

      storeItems([
        ...(data.news || []),
        ...(data.breves || []),
        ...(data.analyses || []),
        ...(data.numbers || []),
      ]);

    } catch (e) {
      console.error("Erreur search digest", e);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     MAP ORDER → DATA
  ========================================================= */

  const editorialNews = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "news")
        .map((i) => selectedItemsMap[i.id])
        .filter(Boolean) as NewsletterNewsItem[],
    [editorialOrder, selectedItemsMap]
  );

  const editorialBreves = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "breve")
        .map((i) => selectedItemsMap[i.id])
        .filter(Boolean) as NewsletterNewsItem[],
    [editorialOrder, selectedItemsMap]
  );

  const editorialAnalyses = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "analysis")
        .map((i) => selectedItemsMap[i.id])
        .filter(Boolean) as NewsletterAnalysisItem[],
    [editorialOrder, selectedItemsMap]
  );

  const editorialNumbers = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "number")
        .map((i) => selectedItemsMap[i.id])
        .filter(Boolean) as NewsletterNumberItem[],
    [editorialOrder, selectedItemsMap]
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-4">

      <h1 className="text-lg font-semibold tracking-tight">
        Digest
      </h1>

      {/* 🔥 TEMPLATE SELECTOR */}
      <div className="flex gap-3 items-center">

        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">Choisir un template</option>
          {templates.map((t) => (
            <option key={t.id_template} value={t.id_template}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => applyTemplate(selectedTemplateId)}
          disabled={!selectedTemplateId}
          className="px-3 py-2 bg-black text-white text-xs rounded"
        >
          Appliquer
        </button>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.3fr] gap-6 items-start">

        {/* LEFT */}
        <div className="space-y-5">

          <DigestHeaderConfig
            headerConfig={headerConfig}
            setHeaderConfig={setHeaderConfig}
            introText={introText}
            setIntroText={setIntroText}
          />

          <DigestTopicStats period={30} />

          <DigestEngine
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            selectedCompanies={selectedCompanies}
            setSelectedCompanies={setSelectedCompanies}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            onSearch={handleSearch}
          />

          <DigestSelectors
            news={news}
            breves={breves}
            analyses={analyses}
            numbers={numbers}
            editorialOrder={editorialOrder}
            setEditorialOrder={setEditorialOrder}
          />

          <DigestEditorialFlow
            editorialOrder={editorialOrder}
            news={editorialNews}
            breves={editorialBreves}
            analyses={editorialAnalyses}
            numbers={editorialNumbers}
            setEditorialOrder={setEditorialOrder}
          />

        </div>

        {/* RIGHT */}
        <div className="sticky top-6 h-[calc(100vh-4rem)] overflow-y-auto pr-2">

          <DigestPreviewPanel
            headerConfig={headerConfig}
            editorialHtml={introText}
            news={editorialNews}
            breves={editorialBreves}
            analyses={editorialAnalyses}
            numbers={editorialNumbers}
            topicStats={topicStats}
          />

        </div>

      </div>

    </div>
  );
}
