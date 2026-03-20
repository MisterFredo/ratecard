"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";
import FilterPanel from "@/components/feed/FilterPanel";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { searchCurator } from "@/lib/search"; // 🔥 nouveau chemin
import { getFeedMeta } from "@/lib/meta";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  /* ============================
     STATE
  ============================ */

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [meta, setMeta] = useState({
    topics: [],
    companies: [],
    solutions: [],
    news_types: [],
  });

  const [params, setParams] = useState({
    query: "",
    topic_ids: [] as string[],
    company_ids: [] as string[],
    solution_ids: [] as string[],
    news_types: [] as string[],
  });

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [mode, setMode] = useState<"text" | "filters">("filters");

  /* ============================
     META
  ============================ */

  useEffect(() => {
    async function loadMeta() {
      const res = await getFeedMeta();
      setMeta(res);
    }
    loadMeta();
  }, []);

  /* ============================
     LOAD
  ============================ */

  async function load(reset = false) {
    if (loading) return;

    setLoading(true);

    const currentOffset = reset ? 0 : offset;

    const res = await searchCurator({
      ...(mode === "text"
        ? { query: params.query }
        : {
            topic_ids: params.topic_ids,
            company_ids: params.company_ids,
            solution_ids: params.solution_ids,
            news_types: params.news_types,
          }),
      limit: LIMIT,
      offset: currentOffset,
    });

    const newItems = res.items;

    if (reset) {
      setItems(newItems);
      setOffset(LIMIT);
    } else {
      setItems((prev) => [...prev, ...newItems]);
      setOffset((prev) => prev + LIMIT);
    }

    setHasMore(newItems.length === LIMIT);
    setLoading(false);
  }

  /* ============================
     INITIAL LOAD
  ============================ */

  useEffect(() => {
    load(true);
  }, []);

  /* ============================
     ACTIONS
  ============================ */

  function handleSearchText() {
    setMode("text");

    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
  }

  function handleApplyFilters() {
    setMode("filters");

    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
  }

  function handleReset() {
    setParams({
      query: "",
      topic_ids: [],
      company_ids: [],
      solution_ids: [],
      news_types: [],
    });

    setMode("filters");

    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
  }

  /* ============================
     HELPERS
  ============================ */

  function updateParams(patch: Partial<typeof params>) {
    setParams((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={params.query}
        setQuery={(v) => updateParams({ query: v })}

        newsTypes={params.news_types}
        setNewsTypes={(v) => updateParams({ news_types: v })}

        newsTypeOptions={meta.news_types}

        onSearch={handleSearchText}       // 🔥 bouton SEARCH
        onReset={handleReset}
      />

      {/* 🔥 bouton FILTERS séparé */}
      <div className="flex justify-end">
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Apply Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterPanel
          title="Topics"
          items={meta.topics}
          selected={params.topic_ids}
          onChange={(v) => updateParams({ topic_ids: v })}
        />

        <FilterPanel
          title="Companies"
          items={meta.companies}
          selected={params.company_ids}
          onChange={(v) => updateParams({ company_ids: v })}
        />

        <FilterPanel
          title="Solutions"
          items={meta.solutions}
          selected={params.solution_ids}
          onChange={(v) => updateParams({ solution_ids: v })}
        />
      </div>

      <FeedList
        title="Results"
        items={items}
        total={total}
        mode={mode}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => load(false)}
        onSelectItem={setSelectedItem}
      />

      {selectedItem?.type === "analysis" && (
        <AnalysisDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {selectedItem?.type === "news" && (
        <NewsDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
