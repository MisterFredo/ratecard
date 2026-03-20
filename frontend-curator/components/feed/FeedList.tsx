"use client";

import { useState } from "react";

import FeedRow from "@/components/feed/FeedRow";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void> | void;
  onSelectItem: (item: FeedItem) => void;

  title?: string;
};

/* ========================================================= */

export default function FeedList({
  items,
  loading,
  hasMore,
  onLoadMore,
  onSelectItem,
  title,
}: Props) {

  const [isFetchingMore, setIsFetchingMore] = useState(false);

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
     RENDER
  ========================================================= */

  return (
    <div className="space-y-4">

      {/* ============================
         TITLE (OPTIONAL)
      ============================ */}
      {title && (
        <div className="text-sm font-semibold text-gray-500">
          {title}
        </div>
      )}

      {/* ============================
         EMPTY STATE
      ============================ */}
      {!loading && items.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-10">
          Aucun résultat
        </div>
      )}

      {/* ============================
         ITEMS
      ============================ */}
      {items.map((item) => (
        <FeedRow
          key={`${item.type}-${item.id}`}
          item={item}
          onClick={() => onSelectItem(item)}
        />
      ))}

      {/* ============================
         LOAD MORE
      ============================ */}
      {hasMore && !loading && items.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="
              text-sm px-4 py-2 rounded-lg border border-gray-300
              hover:bg-gray-100 transition
            "
          >
            Charger plus
          </button>
        </div>
      )}

      {/* ============================
         LOADING
      ============================ */}
      {(loading || isFetchingMore) && (
        <div className="text-center text-sm text-gray-400 py-4">
          Chargement…
        </div>
      )}

    </div>
  );
}
