"use client";

import type { FeedItem } from "@/types/home";

type Props = {
  item: FeedItem;
  onSelect?: () => void;
};

export default function FeedCard({
  item,
  onSelect,
}: Props) {

  const isAnalysis = item.type === "analysis";

  return (
    <div
      onClick={onSelect}
      className={`
        cursor-pointer
        bg-white border rounded-xl p-4 shadow-sm
        hover:shadow-md transition flex flex-col gap-3
        ${isAnalysis ? "border-teal-200" : "border-gray-200"}
      `}
    >
      {/* TYPE */}
      <div className="text-xs uppercase text-gray-400 flex items-center justify-between">
        <span>{isAnalysis ? "Analyse" : "News"}</span>

        {/* Company pour news */}
        {!isAnalysis && item.company && (
          <span className="text-gray-500 normal-case">
            {item.company}
          </span>
        )}
      </div>

      {/* TITLE */}
      <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
        {item.title}
      </h3>

      {/* DATE */}
      {item.published_at && (
        <div className="text-xs text-gray-500">
          {new Date(item.published_at).toLocaleDateString("fr-FR")}
        </div>
      )}

      {/* SIGNAL (analysis only) */}
      {isAnalysis && item.signal && (
        <div className="text-xs text-teal-700 font-medium border-t pt-2">
          {item.signal}
        </div>
      )}

      {/* EXCERPT */}
      {item.excerpt && (
        <p className="text-sm text-gray-600 border-t pt-2 line-clamp-3">
          {item.excerpt}
        </p>
      )}
    </div>
  );
}
