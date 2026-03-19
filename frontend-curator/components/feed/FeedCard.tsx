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
    <article
      onClick={onSelect}
      className="cursor-pointer border-b border-gray-100 pb-5 hover:bg-gray-50 transition"
    >
      {/* ============================= */}
      {/* SIGNAL (TOP PRIORITY) */}
      {/* ============================= */}
      {isAnalysis && item.signal && (
        <div className="text-sm font-semibold text-teal-700 mb-1">
          {item.signal}
        </div>
      )}

      {/* ============================= */}
      {/* META */}
      {/* ============================= */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
        <span className="uppercase tracking-wide">
          {isAnalysis ? "Analyse" : "News"}
        </span>

        {!isAnalysis && item.company && (
          <span className="normal-case text-gray-500">
            {item.company}
          </span>
        )}
      </div>

      {/* ============================= */}
      {/* TITLE */}
      {/* ============================= */}
      <h2 className="text-[15px] font-medium text-gray-900 leading-snug mb-1 hover:text-black transition">
        {item.title}
      </h2>

      {/* ============================= */}
      {/* EXCERPT */}
      {/* ============================= */}
      {item.excerpt && (
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
          {item.excerpt}
        </p>
      )}

      {/* ============================= */}
      {/* DATE */}
      {/* ============================= */}
      {item.published_at && (
        <div className="text-[11px] text-gray-400 mt-2">
          {new Date(item.published_at).toLocaleDateString("fr-FR")}
        </div>
      )}
    </article>
  );
}
