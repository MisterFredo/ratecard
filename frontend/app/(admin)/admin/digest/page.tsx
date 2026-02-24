"use client";

import { useMemo, useState } from "react";
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
} from "@/types/newsletter";
import type { SelectOption } from "@/components/ui/SearchableMultiSelect";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

export default function DigestPage() {
  const [loading, setLoading] = useState(false);

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] =
    useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [selectedTopics, setSelectedTopics] =
    useState<SelectOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] =
    useState<SelectOption[]>([]);
  const [selectedTypes, setSelectedTypes] =
    useState<SelectOption[]>([]);

  const [headerConfig, setHeaderConfig] =
    useState({
      title: "Newsletter Ratecard",
      subtitle: "",
      coverImageUrl: "",
      mode: "ratecard" as "ratecard" | "client",
      showTopicStats: false,
    });

  const [introText, setIntroText] =
    useState("");

  const [editorialOrder, setEditorialOrder] =
    useState<EditorialItem[]>([]);

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

        {/* =========================
           LEFT — ÉDITION
        ========================= */}
        <div className="space-y-5">

          {/* CONFIG */}
          <DigestHeaderConfig
            headerConfig={headerConfig}
            setHeaderConfig={setHeaderConfig}
          />

          {/* INTRO */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Introduction
            </h2>

            <textarea
              className="
                w-full
                border border-gray-200
                rounded-lg
                px-3 py-2
                text-sm
                min-h-[100px]
                resize-y
              "
              value={introText}
              onChange={(e) =>
                setIntroText(e.target.value)
              }
            />
          </section>

          {/* BAROMÈTRE */}
          <DigestTopicStats period={30} />

          {/* MOTEUR */}
          <DigestEngine
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            selectedCompanies={selectedCompanies}
            setSelectedCompanies={setSelectedCompanies}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            onSearch={handleSearch}
          />

          {/* SÉLECTION */}
          <DigestSelectors
            news={news}
            breves={breves}
            analyses={analyses}
            editorialOrder={editorialOrder}
            setEditorialOrder={setEditorialOrder}
          />

          {/* FLUX */}
          <DigestEditorialFlow
            editorialOrder={editorialOrder}
            news={news}
            breves={breves}
            analyses={analyses}
            setEditorialOrder={setEditorialOrder}
          />

        </div>

        {/* =========================
           RIGHT — PREVIEW
        ========================= */}
        <div className="sticky top-6 h-[calc(100vh-4rem)] overflow-y-auto pr-1">
          <DigestPreviewPanel
            headerConfig={headerConfig}
            introText={introText}
            news={editorialNews}
            breves={editorialBreves}
            analyses={editorialAnalyses}
          />
        </div>

      </div>
    </div>
  );
}
