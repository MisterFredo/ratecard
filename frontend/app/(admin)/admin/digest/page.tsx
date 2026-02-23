"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import DigestHeaderConfig from "@/components/digest/DigestHeaderConfig";
import DigestSearchBar from "@/components/digest/DigestSearchBar";
import DigestSelectors from "@/components/digest/DigestSelectors";
import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";
import DigestIntroBlock from "@/components/digest/DigestIntroBlock";

import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import ClientNewsletterPreview from "@/components/newsletter/ClientNewsletterPreview";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* ========================================================= */

type DigestModel = {
  id_template: string;
  name: string;
  topics: string[];
  companies: string[];
  news_types: string[];
};

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

type HeaderConfig = {
  title: string;
  subtitle?: string;
  coverImageUrl?: string;
  mode: "ratecard" | "client";
};

/* ========================================================= */

export default function DigestPage() {
  const [models, setModels] = useState<DigestModel[]>([]);
  const [selectedModelId, setSelectedModelId] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [news, setNews] = useState<
    NewsletterNewsItem[]
  >([]);
  const [breves, setBreves] = useState<
    NewsletterNewsItem[]
  >([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [editorialOrder, setEditorialOrder] =
    useState<EditorialItem[]>([]);

  const [introText, setIntroText] = useState("");

  const [headerConfig, setHeaderConfig] =
    useState<HeaderConfig>({
      title: "Newsletter Ratecard",
      subtitle: "",
      coverImageUrl: "",
      mode: "ratecard",
    });

  /* ============================= */

  useEffect(() => {
    async function loadTemplates() {
      const data = await api.get(
        "/admin/digest/template"
      );
      setModels(data || []);
    }
    loadTemplates();
  }, []);

  async function handleSearch() {
    setLoading(true);

    try {
      const model = models.find(
        (m) => m.id_template === selectedModelId
      );

      const json = await api.post(
        "/admin/digest/search",
        {
          topics: model?.topics,
          companies: model?.companies,
          news_types: model?.news_types,
          limit: 20,
        }
      );

      setNews(json.news || []);
      setBreves(json.breves || []);
      setAnalyses(json.analyses || []);
      setEditorialOrder([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleEditorialItem(
    id: string,
    type: EditorialItem["type"]
  ) {
    const exists = editorialOrder.find(
      (item) =>
        item.id === id && item.type === type
    );

    if (exists) {
      setEditorialOrder((prev) =>
        prev.filter(
          (item) =>
            !(item.id === id && item.type === type)
        )
      );
    } else {
      setEditorialOrder((prev) => [
        ...prev,
        { id, type },
      ]);
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;

    setEditorialOrder((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];
      return updated;
    });
  }

  function moveDown(index: number) {
    if (index === editorialOrder.length - 1)
      return;

    setEditorialOrder((prev) => {
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [
        updated[index],
        updated[index + 1],
      ];
      return updated;
    });
  }

  function removeItem(index: number) {
    setEditorialOrder((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

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

  return (
    <div className="space-y-12">
      <DigestSearchBar
        models={models}
        selectedModelId={selectedModelId}
        setSelectedModelId={setSelectedModelId}
        handleSearch={handleSearch}
        loading={loading}
      />

      <DigestHeaderConfig
        headerConfig={headerConfig}
        setHeaderConfig={setHeaderConfig}
      />

      <DigestSelectors
        news={news}
        breves={breves}
        analyses={analyses}
        editorialOrder={editorialOrder}
        toggleEditorialItem={
          toggleEditorialItem
        }
      />

      <DigestEditorialFlow
        editorialOrder={editorialOrder}
        news={news}
        breves={breves}
        analyses={analyses}
        moveUp={moveUp}
        moveDown={moveDown}
        removeItem={removeItem}
      />

      <DigestIntroBlock
        introText={introText}
        setIntroText={setIntroText}
      />

      <NewsletterPreview
        headerConfig={headerConfig}
        introText={introText}
        news={editorialNews}
        breves={editorialBreves}
        analyses={editorialAnalyses}
      />

      <ClientNewsletterPreview
        introText={introText}
        news={editorialNews}
        breves={editorialBreves}
        analyses={editorialAnalyses}
      />
    </div>
  );
}
