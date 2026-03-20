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

  // 🔥 NEW → loading item (UX)
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

      setItems(res.items);
      setTotal(res.count ?? res.items.length);
    } finally {
      setLoading(false);
    }
  }

  /* ============================
     ACTIONS
  ============================ */

  function handleSearch() {
    setItems([]);
    load(query); // ✅ FIX double clic
  }

  function handleSelectItem(item: FeedItem) {
    setLoadingItemId(item.id); // 🔥 feedback immédiat
    setSelectedItem(item);

    // petit délai pour laisser le temps au drawer de monter
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
        onSearch={() => load(query)} // ✅ FIX ici aussi
      />

      <FeedList
        title="Results"
        items={items}
        total={total}
        loading={loading}
        hasMore={false}
        onLoadMore={() => {}}
        onSelectItem={handleSelectItem}

        // 🔥 NEW → pour feedback visuel
        loadingItemId={loadingItemId}
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
