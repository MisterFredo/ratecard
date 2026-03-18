"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedControlBar from "@/components/feed/FeedControlBar";
import FeedGrid from "@/components/feed/FeedGrid";

import PaginationControls from "@/components/ui/PaginationControls";
import FicheDrawer from "@/components/home/FicheDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";

import type { FeedItem } from "@/types/home";

/* =========================================================
   TYPES LOCAUX (V1 — simple)
========================================================= */
type FeedFilters = {
  query: string;
  mode: "explore" | "watch";
};

export default function FeedPage() {
  /* =====================================================
     STATE
  ===================================================== */

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

  /* =====================================================
     DATA LOADING
  ===================================================== */

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

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <FeedHeader />

      {/* CONTROL BAR */}
      <FeedControlBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1); // reset pagination
        }}
      />

      {/* FEED GRID */}
      <FeedGrid
        items={items}
        isLoading={loading}
        onSelectItem={setSelectedFiche}
      />

      {/* PAGINATION */}
      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={totalItems}
        onPageChange={setPage}
      />

      {/* DRAWER */}
      {selectedFiche && (
        <FicheDrawer
          fiche={selectedFiche}
          onClose={() => setSelectedFiche(null)}
        />
      )}
    </div>
  );
}
