"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import FilterPanel from "@/components/feed/FilterPanel";

import { getFeedItems } from "@/lib/feed/getFeedItems";
import { getFeedMeta } from "@/lib/feed/getFeedMeta";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type MetaItem = {
  id: string;
  label: string;
  count: number;
};

type Meta = {
  topics: MetaItem[];
  companies: MetaItem[];
  solutions: MetaItem[];
  news_types: MetaItem[];
};

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 META
  const [meta, setMeta] = useState<Meta>({
    topics: [],
    companies: [],
    solutions: [],
    news_types: [],
  });

  // 🔥 PARAMS (SANS types)
  const [params, setParams] = useState({
    query: "",
    topic_ids: [] as string[],
    company_ids: [] as string[],
    solution_ids: [] as string[],
    news_types: [] as string[],
  });

  const [reloadKey, setReloadKey] = useState(0);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     LOAD META
  ============================ */

  useEffect(() => {
    async function loadMeta() {
      const res = await getFeedMeta();
      setMeta(res);
    }
    loadMeta();
  }, []);

  /* ============================
     LOAD FEED
  ============================ */

  async function load(reset = false) {
    if (loading) return;

    setLoading(true);

    const currentOffset = reset ? 0 : offset;

    const res = await getFeedItems({
      ...params,
      limit: LIMIT,
      offset: currentOffset,
    });

    if (reset) {
      setItems(res.items);
      setOffset(LIMIT);
    } else {
      setItems((prev) => [...prev, ...res.items]);
      setOffset((prev) => prev + LIMIT);
    }

    setHasMore(res.items.length === LIMIT);

    setLoading(false);
  }

  /* ============================
     INITIAL LOAD
  ============================ */

  useEffect(() => {
    load(true);
    // eslint-disable-next-line
  }, []);

  /* ============================
     RELOAD CONTROLLED
  ============================ */

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
    // eslint-disable-next-line
  }, [reloadKey]);

  /* ============================
     HELPERS
  ============================ */

  function updateParams(patch: Partial<typeof params>) {
    setParams((prev) => {
      const next = { ...prev, ...patch };

      // 🔥 trigger reload
      setReloadKey((k) => k + 1);

      return next;
    });
  }

  function handleReset() {
    setParams({
      query: "",
      topic_ids: [],
      company_ids: [],
      solution_ids: [],
      news_types: [],
    });

    setReloadKey((k) => k + 1);
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-6">

      {/* ============================
         HEADER
      ============================ */}
      <FeedHeader
        query={params.query}
        setQuery={(v) => updateParams({ query: v })}

        newsTypes={params.news_types}
        setNewsTypes={(v) => updateParams({ news_types: v })}

        newsTypeOptions={meta.news_types || []}

        onSearch={() => setReloadKey((k) => k + 1)}
        onReset={handleReset}
      />

      {/* ============================
         FILTERS
      ============================ */}
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

      {/* ============================
         FEED
      ============================ */}
      <FeedList
        items={items}
        loading={loading}
        onSelectItem={setSelectedItem}
        onLoadMore={() => load(false)}
        hasMore={hasMore}
      />

      {/* ============================
         DRAWERS
      ============================ */}

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
