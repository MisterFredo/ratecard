"use client";

import type { FeedItem } from "@/types/home";
import FeedCard from "./FeedCard";

type Props = {
  items: FeedItem[];
  isLoading?: boolean;
  onSelectItem?: (item: FeedItem) => void;
};

export default function FeedGrid({
  items,
  isLoading = false,
  onSelectItem,
}: Props) {
  if (isLoading) {
    return (
      <div className="text-sm text-gray-400">
        Chargement…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-sm text-gray-500 italic">
        Aucun résultat
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <FeedCard
          key={`${item.type}-${item.id}`}
          item={item}
          onSelect={() => onSelectItem?.(item)}
        />
      ))}
    </div>
  );
}
