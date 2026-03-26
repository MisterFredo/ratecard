"use client";

import { useState, useEffect } from "react";

import NumbersExplorer from "@/components/numbers/NumbersExplorer";
import NumberDrawer from "@/components/drawers/NumberDrawer";

import { api } from "@/lib/api";

/* ========================================================= */

export default function NumbersPage() {
  const LIMIT = 20;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedItem, setSelectedItem] =
    useState<any | null>(null);

  /* ========================================================= */

  async function load(reset = false, q?: string) {
    const finalQuery = (q ?? query)?.trim();

    if (loading) return;
    setLoading(true);

    try {
      const currentOffset = reset ? 0 : offset;

      const res = await api.get("/numbers/feed", {
        query: finalQuery,
        limit: LIMIT,
        offset: currentOffset,
      });

      if (reset) {
        setItems(res);
        setOffset(res.length);
      } else {
        setItems((prev) => [...prev, ...res]);
        setOffset((prev) => prev + res.length);
      }

      setHasMore(res.length === LIMIT);

    } finally {
      setLoading(false);
    }
  }

  /* ========================================================= */

  useEffect(() => {
    load(true);
  }, []);

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

      {/* FEED */}
      <div>
        <NumbersExplorer
          query={query}
          setQuery={setQuery}
          onSearch={() => load(true, query)}

          items={items}
          loading={loading}
          hasMore={hasMore}

          onLoadMore={() => load(false)}
          onSelectItem={setSelectedItem}
        />
      </div>

      {/* DRAWER */}
      {selectedItem && (
        <NumberDrawer
          id={selectedItem.id}
          entityType={selectedItem.entity_type}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
