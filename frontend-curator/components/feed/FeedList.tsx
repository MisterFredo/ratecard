"use client";

import type { FeedItem } from "@/types/home";

type Props = {
  items: FeedItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectItem: (item: FeedItem) => void;
};

export default function FeedList({
  items,
  loading,
  hasMore,
  onLoadMore,
  onSelectItem,
}: Props) {
  return (
    <div className="space-y-4">

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
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Charger plus
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Chargement…
        </div>
      )}
    </div>
  );
}
