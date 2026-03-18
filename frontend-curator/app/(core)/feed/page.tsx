"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedControlBar from "@/components/feed/FeedControlBar";
import FeedGrid from "@/components/feed/FeedGrid";
import ActiveFilters from "@/components/feed/ActiveFilters";

import PaginationControls from "@/components/ui/PaginationControls";
import FicheDrawer from "@/components/home/FicheDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";
import { addToLibrary } from "@/lib/library/addToLibrary";

import type { FeedItem } from "@/types/home";

/* =========================================================
   TYPES
========================================================= */
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

  const [selectedFiche, setSelectedFiche] =
    useState<FeedItem | null>(null);

  /* ============================
     DATA
  ============================ */
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

  /* ============================
     HANDLERS
  ============================ */

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

   

  /* ============================
     RENDER
  ============================ */

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
        onSelectItem={setSelectedFiche}
        onBadgeClick={handleBadgeClick}
        onAddToLibrary={handleAddToLibrary}
      />

      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={totalItems}
        onPageChange={setPage}
      />

      {selectedFiche && (
        <FicheDrawer
          fiche={selectedFiche}
          onClose={() => setSelectedFiche(null)}
        />
      )}
    </div>
  );
}
