"use client";

import { useMemo, useState, useEffect } from "react";
import DigestEngine from "@/components/digest/DigestEngine";
import DigestSelectors from "@/components/digest/DigestSelectors";
import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";
import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import DigestPreviewPanel from "@/components/newsletter/DigestPreviewPanel";
import DigestTopicStats from "@/components/digest/DigestTopicStats";
import { api } from "@/lib/api";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  HeaderConfig,
} from "@/types/newsletter";
import type { SelectOption } from "@/components/ui/SearchableMultiSelect";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

type TopicStat = {
  label: string;
  count: number;
};

export default function DigestPage() {
  const [loading, setLoading] = useState(false);

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [selectedTopics, setSelectedTopics] =
    useState<SelectOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] =
    useState<SelectOption[]>([]);
  const [selectedTypes, setSelectedTypes] =
    useState<SelectOption[]>([]);

  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>({
      title: "Newsletter Ratecard",
      subtitle: "",
      headerCompany: undefined,
      showTopicStats: false,
    });

  const [introText, setIntroText] = useState("");
  const [editorialOrder, setEditorialOrder] =
    useState<EditorialItem[]>([]);

  /* ==============================
     BAROMÈTRE BACKEND (12 topics)
  ============================== */

  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get("/news/breves/stats");

        const topics =
          (res.topics_stats || [])
            .map((t: any) => ({
              label: t.label,
              count: t.last_30_days ?? 0,
            }))
            .sort((a: TopicStat, b: TopicStat) => b.count - a.count);

        setTopicStats(topics);

      } catch (e) {
        console.error("Erreur chargement baromètre", e);
      }
    }

    loadStats();
  }, []);

  /* ==============================
     SEARCH
  ============================== */

  async function handleSearch(filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
    period: "total" | "30d" | "7d";
  }) {
    setLoading(true);

    try {
      const json = await api.post(
        "/admin/digest/search",
        {
          ...filters,
          limit: 20,
        }
      );

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

  /* ==============================
     MAP ORDER → DATA
  ============================== */

  const editorialNews = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "news")
        .map((i) =>
          news.find((n) => n.id === i.id)
        )
        .filter(Boolean) as NewsletterNewsItem[],
    [editorialOrder, news]
  );

  const editorialBreves = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "breve")
        .map((i) =>
          breves.find((b) => b.id === i.id)
        )
        .filter(Boolean) as NewsletterNewsItem[],
    [editorialOrder, breves]
  );

  const editorialAnalyses = useMemo(
    () =>
      editorialOrder
        .filter((i) => i.type === "analysis")
        .map((i) =>
          analyses.find((a) => a.id === i.id)
        )
        .filter(Boolean) as NewsletterAnalysisItem[],
    [editorialOrder, analyses]
  );

  /* ==============================
     LAYOUT
  ============================== */

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">
        Digest
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6 items-start">

        {/* LEFT */}
        <div className="space-y-5">

          <DigestHeaderConfig
            headerConfig={headerConfig}
            setHeaderConfig={setHeaderConfig}
            introText={introText}
            setIntroText={setIntroText}
          />

          {/* Visible en admin uniquement */}
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
            editorialOrder={editorialOrder}
            setEditorialOrder={setEditorialOrder}
          />

          <DigestEditorialFlow
            editorialOrder={editorialOrder}
            news={news}
            breves={breves}
            analyses={analyses}
            setEditorialOrder={setEditorialOrder}
          />

        </div>

        {/* RIGHT */}
        <div className="sticky top-6 h-[calc(100vh-4rem)] overflow-y-auto pr-1">
          <DigestPreviewPanel
            headerConfig={headerConfig}
            introText={introText}
            news={editorialNews}
            breves={editorialBreves}
            analyses={editorialAnalyses}
            topicStats={topicStats} // 🔥 injecté ici
          />
        </div>

      </div>
    </div>
  );
}
