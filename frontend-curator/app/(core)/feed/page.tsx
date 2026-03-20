"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { searchCurator } from "@/lib/search";

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

  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     LOAD
  ============================ */

  async function load(reset = false) {
    if (loading) return;

    if (!query || query.trim() === "") return;

    setLoading(true);

    const currentOffset = reset ? 0 : offset;

    const res = await searchCurator({
      query,
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

    setTotal(res.count ?? newItems.length);
    setHasMore(newItems.length === LIMIT);
    setLoading(false);
  }

  /* ============================
     ACTIONS
  ============================ */

  function handleSearch() {
    setItems([]);
    setOffset(0);
    setHasMore(true);

    load(true);
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
      />

      <FeedList
        title="Results"
        items={items}
        total={total}
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
