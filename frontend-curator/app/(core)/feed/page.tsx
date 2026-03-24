"use client";

import { useState, useEffect } from "react";

import FeedExplorer from "@/components/feed/FeedExplorer";
import SelectionPanel from "@/components/insight/SelectionPanel";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getContentStats } from "@/lib/stats";
import { searchCurator, getLatestCurator } from "@/lib/search";

import type { FeedItem, FeedBadge } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  /* =========================================================
     DATA
  ========================================================= */

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<any>(null);

  /* =========================================================
     SELECTION
  ========================================================= */

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /* =========================================================
     OUTPUT (UNIQUE)
  ========================================================= */

  const [finalEmail, setFinalEmail] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  /* =========================================================
     DRAWER
  ========================================================= */

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [loadingItemId, setLoadingItemId] =
    useState<string | null>(null);

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
        setOffset(res.items.length);
      } else {
        setItems((prev) => [...prev, ...res.items]);
        setOffset((prev) => prev + res.items.length);
      }

      setTotal(res.count ?? 0);
      setHasMore(res.items.length === LIMIT);

    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    load(true);
  }, []);

  /* =========================================================
     STATS
  ========================================================= */

  useEffect(() => {
    async function loadStats() {
      const s = await getContentStats();
      setStats(s);
    }

    loadStats();
  }, []);

  /* =========================================================
     BADGES / STATS
  ========================================================= */

  function handleBadgeClick(badge: FeedBadge) {
    const value = badge.label;
    if (!value) return;

    setQuery(value);
    window.scrollTo({ top: 0 });

    load(true, value);
  }

  function handleStatClick(value: string) {
    if (!value) return;

    setQuery(value);
    window.scrollTo({ top: 0 });

    load(true, value);
  }

  /* =========================================================
     DRAWER
  ========================================================= */

  function handleSelectItem(item: FeedItem) {
    setLoadingItemId(item.id);
    setSelectedItem(item);

    setTimeout(() => {
      setLoadingItemId(null);
    }, 300);
  }

  /* =========================================================
     TOGGLE SELECT
  ========================================================= */

  function toggleSelect(item: FeedItem) {
    setSelectedIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((i) => i !== item.id)
        : [...prev, item.id]
    );
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  async function generatePreview() {
    if (!selectedIds.length) return;

    setLoadingInsight(true);

    try {
      const res = await fetch(
        apiUrl("/api/insight"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            mode: "preview",
          }),
        }
      );

      const json = await res.json();

      setFinalEmail(json.email || "");

    } finally {
      setLoadingInsight(false);
    }
  }

  async function generateInsight() {
    if (!selectedIds.length) return;

    setLoadingInsight(true);

    try {
      const res = await fetch(
        apiUrl("/api/insight"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            mode: "insight",
          }),
        }
      );

      const json = await res.json();

      setFinalEmail(json.final_email || json.email || "");

    } finally {
      setLoadingInsight(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="xl:col-span-2">
        <FeedExplorer
          query={query}
          setQuery={setQuery}
          onSearch={() => load(true, query)}

          stats={stats}
          onClickStat={handleStatClick}

          items={items}
          total={total}
          loading={loading}
          hasMore={hasMore}

          onLoadMore={() => load(false)}
          onSelectItem={handleSelectItem}
          onClickBadge={handleBadgeClick}

          loadingItemId={loadingItemId}

          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
        />
      </div>

      {/* RIGHT */}
      <div className="xl:col-span-1">
        <SelectionPanel
          items={items}
          selectedIds={selectedIds}

          finalEmail={finalEmail}

          loading={loadingInsight}

          onGeneratePreview={generatePreview}
          onGenerateInsight={generateInsight}
        />
      </div>

      {/* DRAWERS */}
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
