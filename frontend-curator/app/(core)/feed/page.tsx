"use client";

import { useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedControlBar from "@/components/feed/FeedControlBar";
import FeedGrid from "@/components/feed/FeedGrid";
import PaginationControls from "@/components/ui/PaginationControls";
import FicheDrawer from "@/components/home/FicheDrawer";

import type { FeedItem } from "@/types/home";
import type { FeedFilters } from "@/types/feed";

export default function FeedPage() {
  const [filters, setFilters] = useState<FeedFilters>({
    query: "",
    selectionIds: [],
    societeIds: [],
    solutionIds: [],
    mode: "explore", // 🔥 clé
  });

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedFiche, setSelectedFiche] =
    useState<FeedItem | null>(null);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <FeedHeader />

      {/* CONTROL BAR */}
      <FeedControlBar
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      {/* GRID */}
      <FeedGrid
        filters={filters}
        page={page}
        pageSize={16}
        onTotalUpdate={setTotal}
        onSelectFiche={setSelectedFiche}
      />

      {/* PAGINATION */}
      <PaginationControls
        page={page}
        pageSize={16}
        total={total}
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
