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

type Mode = "browse" | "scan" | "insight";

export default function FeedPage() {
  const LIMIT = 20;

  const [mode, setMode] = useState<Mode>("browse");

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
     🔥 SCAN STATE
  ========================================================= */

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scanText, setScanText] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  /* =========================================================
     LOAD (SEARCH ou LATEST)
  ========================================================= */

  async function load(reset = false, q?: string) {
    const finalQuery = (q ?? query)?.trim();

    if (loading) return;

    setLoading(true);

    try {
      const currentOffset = reset ? 0 : offset;

      const typeFilter =
        mode === "scan"
          ? "news"
          : mode === "insight"
          ? "analysis"
          : undefined;

      const res = finalQuery
        ? await searchCurator({
            query: finalQuery,
            limit: LIMIT,
            offset: currentOffset,
            type: typeFilter,
          })
        : await getLatestCurator({
            limit: LIMIT,
            offset: currentOffset,
            type: typeFilter,
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
     INITIAL LOAD + MODE CHANGE
  ========================================================= */

  useEffect(() => {
    load(true);
  }, [mode]);

  /* =========================================================
     LOAD STATS
  ========================================================= */

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
    window.scrollTo({ top: 0 });

    load(true, value);
  }

  /* =========================================================
     STAT CLICK
  ========================================================= */

  function handleStatClick(value: string) {
    if (!value) return;

    setQuery(value);
    window.scrollTo({ top: 0 });

    load(true, value);
  }

  /* =========================================================
     SELECT ITEM (DRAWER)
  ========================================================= */

  function handleSelectItem(item: FeedItem) {
    setLoadingItemId(item.id);
    setSelectedItem(item);

    setTimeout(() => {
      setLoadingItemId(null);
    }, 300);
  }

  /* =========================================================
     🔥 MODE SWITCH
  ========================================================= */

  function changeMode(newMode: Mode) {
    setMode(newMode);

    // reset clean
    setSelectedIds([]);
    setScanText("");
    setOffset(0);
  }

  /* =========================================================
     🔥 TOGGLE SELECT (SCAN)
  ========================================================= */

  function toggleSelect(item: FeedItem) {
    if (mode !== "scan") return;
    if (item.type !== "news") return;

    setSelectedIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((i) => i !== item.id)
        : [...prev, item.id]
    );
  }

  /* =========================================================
     🔥 SCAN ACTION
  ========================================================= */

  async function handleScan() {
    if (!selectedIds.length) return;

    setScanLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/news`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedIds }),
        }
      );

      const json = await res.json();
      setScanText(json.text);

    } finally {
      setScanLoading(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {/* 🔥 MODE SWITCH */}
      <div className="flex gap-2">
        <button
          onClick={() => changeMode("browse")}
          className={`px-3 py-1 rounded ${
            mode === "browse" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Explorer
        </button>

        <button
          onClick={() => changeMode("scan")}
          className={`px-3 py-1 rounded ${
            mode === "scan" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Scan
        </button>

        <button
          onClick={() => changeMode("insight")}
          className={`px-3 py-1 rounded ${
            mode === "insight" ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Insight
        </button>
      </div>

      <FeedHeader
        query={query}
        setQuery={setQuery}
        onSearch={() => load(true, query)}
      />

      <StatsBar
        stats={stats}
        onClickStat={handleStatClick}
      />

      {/* 🔥 SCAN BAR */}
      {mode === "scan" && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedIds.length} sélection(s)
          </div>

          <button
            onClick={handleScan}
            disabled={selectedIds.length === 0 || scanLoading}
            className="
              px-4 py-2 rounded-lg text-sm
              bg-black text-white
              disabled:opacity-50
            "
          >
            {scanLoading ? "Scan en cours..." : "Scanner"}
          </button>
        </div>
      )}

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

        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {/* 🔥 SCAN RESULT */}
      {scanText && (
        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">
              Résultat du scan
            </h3>

            <button
              onClick={() =>
                navigator.clipboard.writeText(scanText)
              }
              className="text-xs text-blue-600"
            >
              Copier
            </button>
          </div>

          <textarea
            value={scanText}
            readOnly
            className="w-full min-h-[200px] text-sm p-3 border rounded"
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
