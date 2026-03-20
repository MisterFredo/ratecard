"use client";

import { useState } from "react";

import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";

import AnalysisDrawer from "@/components/drawers/AnalysisDrawer";
import NewsDrawer from "@/components/drawers/NewsDrawer";

import { searchCurator } from "@/lib/search";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

export default function FeedPage() {
  const LIMIT = 20;

  /* ============================
     STATE
  ============================ */

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");

  const [selectedItem, setSelectedItem] =
    useState<FeedItem | null>(null);

  /* ============================
     LOAD
  ============================ */

  async function load() {
    if (loading) return;
    if (!query || query.trim() === "") return;

    setLoading(true);

    const res = await searchCurator({
      query,
      limit: LIMIT,
    });

    setItems(res.items);
    setTotal(res.count ?? res.items.length);

    setLoading(false);
  }

  /* ============================
     ACTIONS
  ============================ */

  function handleSearch() {
    setItems([]);
    load();
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-8">

      <FeedHeader
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
      />

      <FeedList
        title="Results"
        items={items}
        total={total}
        loading={loading}
        hasMore={false} // 🔥 pas de pagination
        onSelectItem={setSelectedItem}
      />

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
