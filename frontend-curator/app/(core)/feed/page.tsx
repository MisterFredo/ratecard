"use client";

import { useState } from "react";

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

  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [loadingItemId, setLoadingItemId] =
    useState<string | null>(null);

  /* ============================
     LOAD
  ============================ */

  async function load(q?: string) {
    const finalQuery = (q ?? query)?.trim();

    if (loading) return;
    if (!finalQuery) return;

    setLoading(true);

    try {
      const res = await searchCurator({
        query: finalQuery,
        limit: LIMIT,
      });

      setItems(res.items ?? []);
      setTotal(res.count ?? res.items?.length ?? 0);
    } finally {
      setLoading(false);
    }
  }

  /* ============================
     ACTIONS
  ============================ */

  function handleSelectItem(item: FeedItem) {
    setLoadingItemId(item.id);
    setSelectedItem(item);

    setTimeout(() => {
      setLoadingItemId(null);
    }, 300);
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={query}
        setQuery={setQuery}
        onSearch={() => load(query)}
      />

      <FeedList
        title="Results"
        items={items}
        total={total}
        loading={loading}
        hasMore={false}
        onLoadMore={() => {}}
        onSelectItem={handleSelectItem}
        loadingItemId={loadingItemId}
      />

      {/* =========================================================
         DRAWERS (LOGIQUE UNIFIÉE)
      ========================================================= */}

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
