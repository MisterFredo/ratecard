"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";
import FilterPanel from "@/components/feed/FilterPanel";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { searchCurator } from "@/lib/feed/searchCurator";
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

  /* ============================
     STATE
  ============================ */

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [meta, setMeta] = useState<Meta>({
    topics: [],
    companies: [],
    solutions: [],
    news_types: [],
  });

  const [params, setParams] = useState({
    query: "",
    topic_ids: undefined as string[] | undefined,
    company_ids: undefined as string[] | undefined,
    solution_ids: undefined as string[] | undefined,
    news_types: undefined as string[] | undefined,
  });

  const [reloadKey, setReloadKey] = useState(0);
  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

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
      ...params,
      limit: LIMIT,
      offset: currentOffset,
    });

    if (reset) {
      setItems(res);
      setOffset(LIMIT);
    } else {
      setItems((prev) => [...prev, ...res]);
      setOffset((prev) => prev + LIMIT);
    }

    setHasMore(res.length === LIMIT);
    setLoading(false);
  }

  /* ============================
     INITIAL
  ============================ */

  useEffect(() => {
    load(true);
  }, []);

  /* ============================
     RELOAD
  ============================ */

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
  }, [reloadKey]);

  /* ============================
     HELPERS
  ============================ */

  function normalizeArray(arr?: string[]) {
    return arr && arr.length > 0 ? arr : undefined;
  }

  function updateParams(patch: Partial<typeof params>) {
    setParams((prev) => {
      const next = {
        ...prev,
        ...patch,
      };

      // 🔥 IMPORTANT → éviter les []
      return {
        ...next,
        topic_ids: normalizeArray(next.topic_ids),
        company_ids: normalizeArray(next.company_ids),
        solution_ids: normalizeArray(next.solution_ids),
        news_types: normalizeArray(next.news_types),
      };
    });

    setReloadKey((k) => k + 1);
  }

  function handleReset() {
    setParams({
      query: "",
      topic_ids: undefined,
      company_ids: undefined,
      solution_ids: undefined,
      news_types: undefined,
    });

    setReloadKey((k) => k + 1);
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={params.query}
        setQuery={(v) => updateParams({ query: v })}

        newsTypes={params.news_types || []}
        setNewsTypes={(v) => updateParams({ news_types: v })}

        newsTypeOptions={meta.news_types || []}

        onSearch={() => setReloadKey((k) => k + 1)}
        onReset={handleReset}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterPanel
          title="Topics"
          items={meta.topics}
          selected={params.topic_ids || []}
          onChange={(v) => updateParams({ topic_ids: v })}
        />

        <FilterPanel
          title="Companies"
          items={meta.companies}
          selected={params.company_ids || []}
          onChange={(v) => updateParams({ company_ids: v })}
        />

        <FilterPanel
          title="Solutions"
          items={meta.solutions}
          selected={params.solution_ids || []}
          onChange={(v) => updateParams({ solution_ids: v })}
        />
      </div>

      <FeedList
        title="Results"
        items={items}
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
