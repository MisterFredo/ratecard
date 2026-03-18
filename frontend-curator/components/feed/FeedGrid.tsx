"use client";

import type { FeedItem } from "@/types/home";
import FeedCard from "./FeedCard";

type Props = {
  items: FeedItem[];
  isLoading?: boolean;
  onSelectItem?: (item: FeedItem) => void;
  onBadgeClick?: (label: string) => void;
  onAddToLibrary?: (item: FeedItem) => void;
};

export default function FeedGrid({
  items,
  isLoading = false,
  onSelectItem,
  onBadgeClick,
  onAddToLibrary,
}: Props) {

  if (isLoading) {
    return <div className="text-sm text-gray-400">Chargement…</div>;
  }

  if (!items.length) {
    return <div className="text-sm text-gray-500 italic">Aucun résultat</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <FeedCard
          key={`${item.type}-${item.id}`}
          item={item}
          onSelect={() => onSelectItem?.(item)}
          onBadgeClick={onBadgeClick}
          onAddToLibrary={() => onAddToLibrary?.(item)}
        />
      ))}
    </div>
  );
}
