"use client";

import { useState, useEffect } from "react";

import FeedExplorer from "@/components/feed/FeedExplorer";
import SelectionPanel from "@/components/insight/SelectionPanel";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getContentStats } from "@/lib/stats";
import { searchCurator, getLatestCurator } from "@/lib/search";

import type { FeedItem, FeedBadge } from "@/types/feed";
import { api } from "@/lib/api";

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
     ANALYSIS
  ========================================================= */

  const [analysis, setAnalysis] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  /* =========================================================
     PANEL STATE (NEW)
  ========================================================= */

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* =========================================================
     DRAWER
  ========================================================= */

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [loadingItemId, setLoadingItemId] =
    useState<string | null>(null);

  /* =========================================================
     LOAD
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

    // 🔥 ouvre automatiquement le panel si on sélectionne
    setIsPanelOpen(true);
  }

  /* =========================================================
     ANALYSIS
  ========================================================= */

  async function generateInsight() {
    if (!selectedIds.length) return;

    setLoadingInsight(true);

    try {
      const res: any = await api.post("/insight/", {
        ids: selectedIds,
        mode: "insight",
      });

      setAnalysis(res.final_email || res.email || "");

    } catch (e) {
      console.error("❌ generateInsight error", e);
    } finally {
      setLoadingInsight(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

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
      {isPanelOpen && (
        <div className="xl:col-span-1 sticky top-6 h-[calc(100vh-120px)]">
          <SelectionPanel
            items={items}
            selectedIds={selectedIds}

            analysis={analysis}
            loading={loadingInsight}

            onGenerateInsight={generateInsight}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}

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
