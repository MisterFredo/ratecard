"use client";

import FeedRow from "@/components/feed/FeedRow";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectItem: (item: FeedItem) => void;

  // 🔵 optionnel → pour affichage (News / Analyses)
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

  function handleLoadMore() {
    if (loading) return;
    onLoadMore();
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
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Charger plus
          </button>
        </div>
      )}

      {/* ============================
         LOADING
      ============================ */}
      {loading && (
        <div className="text-center text-sm text-gray-400 py-4">
          Chargement…
        </div>
      )}

    </div>
  );
}
