"use client";

import { useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedControlBar from "@/components/feed/FeedControlBar";

import PaginationControls from "@/components/ui/PaginationControls";
import FicheDrawer from "@/components/home/FicheDrawer";

import type { FeedItem } from "@/types/home";

/* =========================================================
   TYPES LOCAUX (temporaire → on externalisera plus tard)
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

  const [totalItems, setTotalItems] = useState(0);

  const [selectedFiche, setSelectedFiche] =
    useState<FeedItem | null>(null);

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

      {/* FEED GRID (placeholder pour l’instant) */}
      <div className="border rounded-lg p-6 bg-white text-sm text-gray-500">
        Feed à venir (grid de fiches)
      </div>

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
