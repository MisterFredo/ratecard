"use client";

import { useState, useRef } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { searchCurator } from "@/lib/search";

import type { FeedItem, FeedBadge } from "@/types/feed";

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

  // 🔥 gestion requêtes concurrentes
  const currentQueryRef = useRef("");

  /* ============================
     LOAD (CLEAN + SAFE)
  ============================ */

  async function load(q?: string) {
    const finalQuery = (q ?? query)?.trim();

    if (!finalQuery) return;

    currentQueryRef.current = finalQuery;

    setLoading(true);

    try {
      const res = await searchCurator({
        query: finalQuery,
        limit: LIMIT,
      });

      // 🔥 ignore réponse obsolète
      if (currentQueryRef.current !== finalQuery) return;

      setItems(res.items ?? []);
      setTotal(res.count ?? res.items?.length ?? 0);

    } catch (e) {
      console.error("❌ load error", e);
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

  /* =========================================================
     BADGE CLICK → SEARCH TEXT
  ========================================================= */

  function handleBadgeClick(badge: FeedBadge) {
    const value = badge.label?.trim();

    if (!value) return;

    setQuery(value);
    setItems([]);
    setTotal(0);

    window.scrollTo({ top: 0, behavior: "smooth" });

    load(value);
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
        onClickBadge={handleBadgeClick}
      />

      {/* =========================================================
         DRAWERS
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
