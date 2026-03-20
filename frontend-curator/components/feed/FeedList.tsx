"use client";

import { useState, useMemo } from "react";

import FeedRow from "@/components/feed/FeedRow";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[] | any;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void> | void;
  onSelectItem: (item: FeedItem) => void;

  title?: string;
  total?: number;          // 🔥 NEW (count backend)
  mode?: "text" | "filters"; // 🔥 NEW (UX)

  onClickBadge?: (badge: any) => void;
};

/* ========================================================= */

export default function FeedList({
  items,
  loading,
  hasMore,
  onLoadMore,
  onSelectItem,
  title,
  total,
  mode = "filters",
}: Props) {

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  /* =========================================================
     SAFE ITEMS
  ========================================================= */

  const safeItems: FeedItem[] = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn("⚠️ FeedList received non-array items:", items);
      return [];
    }
    return items;
  }, [items]);

  /* =========================================================
     LOAD MORE
  ========================================================= */

  async function handleLoadMore() {
    if (loading || isFetchingMore) return;

    try {
      setIsFetchingMore(true);
      await onLoadMore();
    } finally {
      setIsFetchingMore(false);
    }
  }

  /* =========================================================
     HEADER LABEL
  ========================================================= */

  const headerLabel = useMemo(() => {
    if (!title) return null;

    let suffix = "";

    if (total !== undefined) {
      suffix = ` (${total})`;
    }

    const modeLabel =
      mode === "text" ? "Search results" : "Filtered results";

    return `${title}${suffix} · ${modeLabel}`;
  }, [title, total, mode]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-4">

      {/* ============================
         HEADER
      ============================ */}
      {headerLabel && (
        <div className="text-sm font-semibold text-gray-500">
          {headerLabel}
        </div>
      )}

      {/* ============================
         EMPTY STATE
      ============================ */}
      {!loading && safeItems.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-10">
          {mode === "text"
            ? "No results for your search"
            : "No results for selected filters"}
        </div>
      )}

      {/* ============================
         ITEMS
      ============================ */}
      {safeItems.map((item) => (
        <FeedRow
          key={`${item.type}-${item.id}`}
          item={item}
          onClick={() => onSelectItem(item)}
        />
      ))}

      {/* ============================
         LOAD MORE
      ============================ */}
      {hasMore && !loading && safeItems.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingMore}
            className="
              text-sm px-4 py-2 rounded-lg border border-gray-300
              hover:bg-gray-100 transition disabled:opacity-50
            "
          >
            {isFetchingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {/* ============================
         LOADING
      ============================ */}
      {loading && safeItems.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-10">
          Loading...
        </div>
      )}

    </div>
  );
}
