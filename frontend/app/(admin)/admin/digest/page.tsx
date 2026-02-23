"use client";

import { useEffect, useMemo, useState } from "react";
import NewsletterSelector from "@/components/newsletter/NewsletterSelector";
import NewsletterPreview from "@/components/newsletter/NewsletterPreview";
import ClientNewsletterPreview from "@/components/newsletter/ClientNewsletterPreview";
import { api } from "@/lib/api";

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

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

/* ========================================================= */

export default function DigestPage() {
  const [models, setModels] = useState<DigestModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [news, setNews] = useState<NewsletterNewsItem[]>([]);
  const [breves, setBreves] = useState<NewsletterNewsItem[]>([]);
  const [analyses, setAnalyses] =
    useState<NewsletterAnalysisItem[]>([]);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [editorialOrder, setEditorialOrder] =
    useState<EditorialItem[]>([]);

  const [introText, setIntroText] = useState("");

  /* -----------------------------------------------------
     LOAD MODELS
  ----------------------------------------------------- */

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

  /* -----------------------------------------------------
     SEARCH
  ----------------------------------------------------- */

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

      setEditorialOrder([]);
    } catch (e) {
      console.error("Erreur search digest", e);
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------------------------------
     LOAD MORE
  ----------------------------------------------------- */

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
        newNews.length === 20 ||
          newBreves.length === 20
      );
    } catch (e) {
      console.error("Erreur load more", e);
    } finally {
      setLoadingMore(false);
    }
  }

  /* -----------------------------------------------------
     EDITORIAL TOGGLE
  ----------------------------------------------------- */

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

  /* -----------------------------------------------------
     MAP EDITORIAL FLOW
  ----------------------------------------------------- */

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
      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">
          Digest
        </h1>

        <div className="flex gap-4 items-center">
          <select
            value={selectedModelId}
            onChange={(e) =>
              setSelectedModelId(e.target.value)
            }
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">
              Flux global (sans modèle)
            </option>
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
      <div className="grid grid-cols-3 gap-10">
        <NewsletterSelector
          title="News"
          items={news}
          selectedIds={editorialOrder
            .filter((i) => i.type === "news")
            .map((i) => i.id)}
          onChange={(ids) =>
            ids.forEach((id) =>
              toggleEditorialItem(id, "news")
            )
          }
        />

        <NewsletterSelector
          title="Brèves"
          items={breves}
          selectedIds={editorialOrder
            .filter((i) => i.type === "breve")
            .map((i) => i.id)}
          onChange={(ids) =>
            ids.forEach((id) =>
              toggleEditorialItem(id, "breve")
            )
          }
        />

        <NewsletterSelector
          title="Analyses"
          items={analyses}
          selectedIds={editorialOrder
            .filter((i) => i.type === "analysis")
            .map((i) => i.id)}
          onChange={(ids) =>
            ids.forEach((id) =>
              toggleEditorialItem(id, "analysis")
            )
          }
        />
      </div>

      {/* FLUX EDITORIAL */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">
          Flux éditorial
        </h2>

        <div className="border rounded-lg bg-white divide-y">
          {editorialOrder.map((item, index) => {
            const source =
              item.type === "news"
                ? news.find((n) => n.id === item.id)
                : item.type === "breve"
                ? breves.find((b) => b.id === item.id)
                : analyses.find((a) => a.id === item.id);

            if (!source) return null;

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between p-3"
              >
                <div className="text-sm">
                  <span className="text-gray-400 uppercase text-xs mr-2">
                    {item.type}
                  </span>
                  {source.title}
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => moveUp(index)}
                    className="px-2 py-1 border rounded"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => moveDown(index)}
                    className="px-2 py-1 border rounded"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() =>
                      removeItem(index)
                    }
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}

          {editorialOrder.length === 0 && (
            <div className="p-4 text-sm text-gray-400 text-center">
              Aucun élément sélectionné
            </div>
          )}
        </div>
      </section>

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

      {/* PREVIEWS */}
      <NewsletterPreview
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
