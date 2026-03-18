"use client";

import type { FeedItem } from "@/types/home";
import BadgeLabel from "@/components/ui/BadgeLabel";

type Props = {
  item: FeedItem;
  onSelect?: () => void;
  onBadgeClick?: (label: string) => void;
  onAddToLibrary?: () => void;
};

export default function FeedCard({
  item,
  onSelect,
  onBadgeClick,
  onAddToLibrary,
}: Props) {

  const isAnalysis = item.type === "analysis";

  return (
    <div
      className={`
        bg-white border rounded-xl p-4 shadow-sm
        hover:shadow-md transition flex flex-col gap-3
        ${isAnalysis ? "border-teal-200" : "border-gray-200"}
      `}
    >
      {/* TYPE */}
      <div className="text-xs uppercase text-gray-400">
        {isAnalysis ? "Analyse" : "Source"}
      </div>

      {/* HEADER */}
      <div className="cursor-pointer" onClick={onSelect}>
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
        <div className="flex flex-wrap gap-1">
          {item.badges.map((badge, i) => (
            <BadgeLabel
              key={i}
              label={badge.label}
              type={badge.type}
              clickable
              onClick={(e) => {
                e.stopPropagation();
                onBadgeClick?.(badge.label);
              }}
            />
          ))}
        </div>
      )}

      {/* ACTION */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToLibrary?.();
        }}
        className="text-xs text-teal-600 hover:underline mt-2"
      >
        + Ajouter au dossier
      </button>
    </div>
  );
}
