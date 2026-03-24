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

export default function FeedPage() {

  const LIMIT = 20;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  const [loadingItemId, setLoadingItemId] =
    useState<string | null>(null);

  /* LOAD */

  async function load(reset = false, q?: string) {
    if (loading) return;

    setLoading(true);

    try {
      const res = q
        ? await searchCurator({ query: q, limit: LIMIT, offset })
        : await getLatestCurator({ limit: LIMIT, offset });

      setItems(reset ? res.items : [...items, ...res.items]);
      setOffset(offset + res.items.length);
      setHasMore(res.items.length === LIMIT);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(true); }, []);

  useEffect(() => {
    getContentStats().then(setStats);
  }, []);

  /* INSIGHT */

  async function generateInsight() {
    if (!selectedIds.length) return;

    setLoadingInsight(true);

    try {
      const res: any = await api.post("/insight/", {
        ids: selectedIds,
        mode: "insight",
      });

      setInsight(res.insight || "");

    } finally {
      setLoadingInsight(false);
    }
  }

  /* HELPERS */

  function toggleSelect(item: FeedItem) {
    setSelectedIds(prev =>
      prev.includes(item.id)
        ? prev.filter(i => i !== item.id)
        : [...prev, item.id]
    );
  }

  function handleSelectItem(item: FeedItem) {
    setSelectedItem(item);
  }

  function handleBadgeClick(badge: FeedBadge) {
    setQuery(badge.label);
    load(true, badge.label);
  }

  const selectedItems = items.filter(i =>
    selectedIds.includes(i.id)
  );

  /* RENDER */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="xl:col-span-2">
        <FeedExplorer
          query={query}
          setQuery={setQuery}
          onSearch={() => load(true, query)}
          stats={stats}
          items={items}
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
      {selectedItems.length > 0 && (
        <div className="xl:col-span-1">
          <div className="sticky top-24">

            <SelectionPanel
              items={selectedItems}
              insight={insight}
              loading={loadingInsight}
              onGenerateInsight={generateInsight}
            />

          </div>
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
