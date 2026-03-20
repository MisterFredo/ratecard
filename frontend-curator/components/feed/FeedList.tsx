"use client";

import { useState, useMemo } from "react";

import FeedRow from "@/components/feed/FeedRow";
import type { FeedItem, FeedBadge } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[] | any;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void> | void;
  onSelectItem: (item: FeedItem) => void;

  title?: string;
  total?: number;
  mode?: "text" | "filters";

  onClickBadge?: (badge: FeedBadge) => void;

  // 🔥 NEW → feedback UX
  loadingItemId?: string | null;
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
  onClickBadge,
  loadingItemId,
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
     HEADER LABEL (plus premium)
  ========================================================= */

  const headerLabel = useMemo(() => {
    if (!title) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700">
          {title}
        </div>

        {total !== undefined && (
          <div className="text-xs text-gray-400">
            {total} results
          </div>
        )}
      </div>
    );
  }, [title, total]);

  /* =========================================================
     SKELETON (premium loading)
  ========================================================= */

  function SkeletonRow() {
    return (
      <div className="animate-pulse space-y-2 py-3 border-b border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-4">

      {/* ============================
         HEADER
      ============================ */}
      {headerLabel}

      {/* ============================
         EMPTY STATE (premium)
      ============================ */}
      {!loading && safeItems.length === 0 && (
        <div className="text-center py-16">
          <div className="text-sm text-gray-400">
            {mode === "text"
              ? "No results found"
              : "No data for selected filters"}
          </div>
        </div>
      )}

      {/* ============================
         LOADING SKELETON
      ============================ */}
      {loading && safeItems.length === 0 && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* ============================
         ITEMS
      ============================ */}
      <div className="divide-y divide-gray-100 rounded-xl bg-white border border-gray-100 overflow-hidden">
        {safeItems.map((item) => (
          <FeedRow
            key={`${item.type}-${item.id}`}
            item={item}
            onClick={() => onSelectItem(item)}
            onClickBadge={onClickBadge}
            loading={loadingItemId === item.id} // 🔥 NEW
          />
        ))}
      </div>

      {/* ============================
         LOAD MORE
      ============================ */}
      {hasMore && !loading && safeItems.length > 0 && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={isFetchingMore}
            className="
              text-sm px-5 py-2 rounded-full
              bg-black text-white
              hover:opacity-90 transition
              disabled:opacity-50
            "
          >
            {isFetchingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
