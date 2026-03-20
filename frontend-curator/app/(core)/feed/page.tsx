"use client";

import { useState, useEffect } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getContentStats } from "@/lib/stats";
import StatsBar from "@/components/feed/StatsBar";

import { searchCurator, getLatestCurator } from "@/lib/search";

import type { FeedItem, FeedBadge } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [loadingItemId, setLoadingItemId] =
    useState<string | null>(null);

  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<any>(null);

  /* =========================================================
     LOAD (SEARCH ou LATEST)
  ========================================================= */

  async function load(reset = false, q?: string) {
    const finalQuery = (q ?? query)?.trim();

    if (loading) return;

    setLoading(true);

    try {
      const currentOffset = reset ? 0 : offset;

      const res = finalQuery
        ? await searchCurator({
            query: finalQuery,
            limit: LIMIT,
            offset: currentOffset,
          })
        : await getLatestCurator({
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

      setTotal(res.count ?? 0);
      setHasMore(res.items.length === LIMIT);

    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INITIAL LOAD (LATEST)
  ========================================================= */

  useEffect(() => {
    load(true);
  }, []);

  useEffect(() => {
    async function loadStats() {
      const s = await getContentStats();
      setStats(s);
    }

    loadStats();
  }, []);

  /* =========================================================
     BADGE CLICK
  ========================================================= */

  function handleBadgeClick(badge: FeedBadge) {
    const value = badge.label;

    if (!value) return;

    setQuery(value);
    setOffset(0);

    window.scrollTo({ top: 0 });

    load(true, value);
  }

  /* =========================================================
     SELECT ITEM
  ========================================================= */

  function handleSelectItem(item: FeedItem) {
    setLoadingItemId(item.id);
    setSelectedItem(item);

    setTimeout(() => {
      setLoadingItemId(null);
    }, 300);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={query}
        setQuery={setQuery}
        onSearch={() => {
          setOffset(0);
          load(true);
        }}
      />

      <StatsBar
        stats={stats}
        onClickStat={(value) => {
          setQuery(value);
          setOffset(0);
          load(true, value);
        }}
      />

      <FeedList
        title="Results"
        items={items}
        total={total}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => load(false)}
        onSelectItem={handleSelectItem}
        onClickBadge={handleBadgeClick}
        loadingItemId={loadingItemId}
      />

      {selectedItem && (
        <>
          {selectedItem.type === "analysis" && (
            <AnalysisDrawer
              id={selectedItem.id}
              onClose={() => setSelectedItem(null)}
            />
          )}

          {selectedItem.type === "news" && (
            <NewsDrawer
              id={selectedItem.id}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
