"use client";

import type { FeedItem } from "@/types/home";
import BadgeLabel from "@/components/ui/BadgeLabel";

type Props = {
  item: FeedItem;
  onSelect?: () => void;
  onBadgeClick?: (label: string) => void;
};

export default function FeedCard({
  item,
  onSelect,
  onBadgeClick,
}: Props) {
  return (
    <div
      className="
        bg-white border rounded-xl p-4 shadow-sm
        hover:shadow-md transition cursor-pointer
        flex flex-col gap-2
      "
      onClick={onSelect}
    >
      {/* TITLE + DATE */}
      <div className="space-y-1">
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
          {item.title}
        </h3>

        {item.date && (
          <div className="text-xs text-gray-500">
            {new Date(item.date).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      {/* EXCERPT */}
      {item.excerpt && (
        <p className="text-sm text-gray-600 border-t pt-2 line-clamp-3">
          {item.excerpt}
        </p>
      )}

      {/* BADGES */}
      {item.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {item.badges.map((badge, i) => (
            <BadgeLabel
              key={i}
              label={badge.label}
              type={badge.type}
              clickable
              onClick={(e) => {
                e.stopPropagation(); // 🔥 important
                onBadgeClick?.(badge.label);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
