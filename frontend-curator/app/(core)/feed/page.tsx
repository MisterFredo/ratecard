"use client";

import { useEffect, useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedGrid from "@/components/feed/FeedGrid";
import CuratorNewsFeed from "@/components/feed/CuratorNewsFeed";
import PaginationControls from "@/components/ui/PaginationControls";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { getFeedItems } from "@/lib/feed/getFeedItems";

import type { FeedItem } from "@/types/home";

/* ========================================================= */

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const pageSize = 16;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     DATA LOADING
  ============================ */

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await getFeedItems({
        filters: {}, // ✅ FIX IMPORTANT
        page,
        pageSize,
      });

      setItems(res.items);

      setLoading(false);
    }

    load();
  }, [page]);

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-10">

      <FeedHeader />

      {/* ============================
         🔥 NEWS (haut de page)
      ============================ */}
      <CuratorNewsFeed />

      {/* ============================
         🔥 ANALYSES
      ============================ */}
      <FeedGrid
        items={items}
        isLoading={loading}
        onSelectItem={setSelectedItem}
      />

      <PaginationControls
        page={page}
        pageSize={pageSize}
        total={9999} // temporaire
        onPageChange={setPage}
      />

      {/* ============================
         DRAWERS
      ============================ */}

      {selectedItem?.type === "analysis" && (
        <AnalysisDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {selectedItem?.type === "news" && (
        <NewsDrawer
          id={selectedItem.id}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
