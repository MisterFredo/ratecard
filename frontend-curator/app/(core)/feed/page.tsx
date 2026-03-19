"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import FilterPanel from "@/components/feed/FilterPanel";

import { getNewsItems } from "@/lib/feed/getNewsItems";
import { getContentItems } from "@/lib/feed/getContentItems";
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
     STATES
  ============================ */

  const [newsItems, setNewsItems] = useState<FeedItem[]>([]);
  const [contentItems, setContentItems] = useState<FeedItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [offsetNews, setOffsetNews] = useState(0);
  const [offsetContent, setOffsetContent] = useState(0);

  const [hasMoreNews, setHasMoreNews] = useState(true);
  const [hasMoreContent, setHasMoreContent] = useState(true);

  const [meta, setMeta] = useState<Meta>({
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
     LOAD
  ============================ */

  async function load(reset = false) {
    if (loading) return;

    setLoading(true);

    const currentNewsOffset = reset ? 0 : offsetNews;
    const currentContentOffset = reset ? 0 : offsetContent;

    const [newsRes, contentRes] = await Promise.all([
      getNewsItems({
        ...params,
        limit: LIMIT,
        offset: currentNewsOffset,
      }),
      getContentItems({
        ...params,
        limit: LIMIT,
        offset: currentContentOffset,
      }),
    ]);

    if (reset) {
      setNewsItems(newsRes.items);
      setContentItems(contentRes.items);

      setOffsetNews(LIMIT);
      setOffsetContent(LIMIT);
    } else {
      setNewsItems((prev) => [...prev, ...newsRes.items]);
      setContentItems((prev) => [...prev, ...contentRes.items]);

      setOffsetNews((prev) => prev + LIMIT);
      setOffsetContent((prev) => prev + LIMIT);
    }

    setHasMoreNews(newsRes.items.length === LIMIT);
    setHasMoreContent(contentRes.items.length === LIMIT);

    setLoading(false);
  }

  /* ============================
     INITIAL LOAD
  ============================ */

  useEffect(() => {
    load(true);
  }, []);

  /* ============================
     RELOAD
  ============================ */

  useEffect(() => {
    setNewsItems([]);
    setContentItems([]);

    setOffsetNews(0);
    setOffsetContent(0);

    setHasMoreNews(true);
    setHasMoreContent(true);

    load(true);
  }, [reloadKey]);

  /* ============================
     HELPERS
  ============================ */

  function updateParams(patch: Partial<typeof params>) {
    setParams((prev) => {
      const next = { ...prev, ...patch };
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
    <div className="space-y-8">

      {/* HEADER */}
      <FeedHeader
        query={params.query}
        setQuery={(v) => updateParams({ query: v })}

        newsTypes={params.news_types}
        setNewsTypes={(v) => updateParams({ news_types: v })}

        newsTypeOptions={meta.news_types || []}

        onSearch={() => setReloadKey((k) => k + 1)}
        onReset={handleReset}
      />

      {/* FILTERS */}
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

      {/* NEWS */}
      <FeedList
        title="News"
        items={newsItems}
        loading={loading}
        hasMore={hasMoreNews}
        onLoadMore={() => load(false)}
        onSelectItem={setSelectedItem}
      />

      {/* ANALYSES */}
      <FeedList
        title="Analyses"
        items={contentItems}
        loading={loading}
        hasMore={hasMoreContent}
        onLoadMore={() => load(false)}
        onSelectItem={setSelectedItem}
      />

      {/* DRAWERS */}
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
