"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedControlBar from "@/components/feed/FeedControlBar";
import FeedGrid from "@/components/feed/FeedGrid";
import ActiveFilters from "@/components/feed/ActiveFilters";

import PaginationControls from "@/components/ui/PaginationControls";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import SourceDrawer from "@/components/drawers/SourceDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";
import { addToLibrary } from "@/lib/library/addToLibrary";

import type { FeedItem } from "@/types/home";

/* ========================================================= */

type FeedFilters = {
  query: string;
  mode: "explore" | "watch";
  badge?: string;
};

export default function FeedPage() {
  const [filters, setFilters] = useState<FeedFilters>({
    query: "",
    mode: "explore",
  });

  const [page, setPage] = useState(1);
  const pageSize = 16;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================ */

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await getFeedItems({
        filters,
        page,
        pageSize,
      });

      setItems(res.items);
      setTotalItems(res.total);

      setLoading(false);
    }

    load();
  }, [filters, page]);

  /* ============================ */

  function handleBadgeClick(label: string) {
    setFilters({
      query: "",
      mode: "explore",
      badge: label,
    });
    setPage(1);
  }

  function handleClearFilters() {
    setFilters({
      query: "",
      mode: "explore",
      badge: undefined,
    });
    setPage(1);
  }

  async function handleAddToLibrary(item: FeedItem) {
    await addToLibrary(item);
  }

  /* ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader />

      <FeedControlBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <ActiveFilters
        badge={filters.badge}
        onClear={handleClearFilters}
      />

      <FeedGrid
        items={items}
        isLoading={loading}
        onSelectItem={setSelectedItem}
        onBadgeClick={handleBadgeClick}
        onAddToLibrary={handleAddToLibrary}
      />

      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={totalItems}
        onPageChange={setPage}
      />

      {selectedItem?.type === "analysis" && (
        <AnalysisDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {selectedItem?.type === "source" && (
        <SourceDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
