"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 état central (clean)
  const [params, setParams] = useState({
    query: "",
    topics: [] as string[],
    companies: [] as string[],
    solutions: [] as string[],
    types: [] as string[],
    news_types: [] as string[],
  });

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     LOAD
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
     AUTO RELOAD (filters)
  ============================ */

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
    // eslint-disable-next-line
  }, [JSON.stringify(params)]);

  /* ============================
     HANDLERS HEADER
  ============================ */

  function handleSearch(query: string) {
    setParams((prev) => ({
      ...prev,
      query,
    }));
  }

  function handleTypes(types: string[]) {
    setParams((prev) => ({
      ...prev,
      types,
    }));
  }

  function handleNewsTypes(news_types: string[]) {
    setParams((prev) => ({
      ...prev,
      news_types,
    }));
  }

  function handleReset() {
    setParams({
      query: "",
      topics: [],
      companies: [],
      solutions: [],
      types: [],
      news_types: [],
    });
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      {/* ============================
         HEADER
      ============================ */}
      <FeedHeader
        query={params.query}
        setQuery={handleSearch}
        types={params.types}
        setTypes={handleTypes}
        newsTypes={params.news_types}
        setNewsTypes={handleNewsTypes}
        onSearch={() => {}}
        onReset={handleReset}
      />

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
