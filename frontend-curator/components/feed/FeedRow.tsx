"use client";

import type { FeedItem, FeedBadge } from "@/types/feed";

/* ========================================================= */

type Props = {
  item: FeedItem;
  onClick: () => void;

  onClickBadge?: (badge: FeedBadge) => void;
};

/* ========================================================= */

export default function FeedRow({
  item,
  onClick,
  onClickBadge,
}: Props) {
  const isNews = item.type === "news";

  const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

  /* =========================================================
     DATE
  ========================================================= */

  let formattedDate: string | null = null;

  try {
    formattedDate = item.published_at
      ? new Date(item.published_at).toLocaleDateString("fr-FR")
      : null;
  } catch {
    formattedDate = null;
  }

  /* =========================================================
     BADGES (BUILD FROM BACKEND DATA)
  ========================================================= */

  const badges: FeedBadge[] = [
    ...(item.news_type
      ? [{ label: item.news_type, type: "news_type" as const }]
      : []),

    ...(item.companies ?? []).map((c) => ({
      label: c,
      type: "company" as const,
    })),

    ...(item.topics ?? []).map((t) => ({
      label: t,
      type: "topic" as const,
    })),

    ...(item.solutions ?? []).map((s) => ({
      label: s,
      type: "solution" as const,
    })),
  ];

  /* =========================================================
     BADGE STYLE
  ========================================================= */

  function getBadgeClass(type?: string) {
    switch (type) {
      case "news_type":
        return "bg-black text-white";
      case "company":
        return "bg-blue-100 text-blue-700";
      case "solution":
        return "bg-purple-100 text-purple-700";
      case "topic":
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /* =========================================================
     IMAGE URL
  ========================================================= */

  const imageUrl =
    isNews &&
    item.has_visual &&
    item.media_id &&
    GCS_BASE_URL
      ? `${GCS_BASE_URL}/news/${item.media_id}`
      : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <article
      onClick={onClick}
      className="
        cursor-pointer
        border-b border-gray-100
        pb-4
        hover:bg-gray-50 transition
      "
    >
      <div className="flex gap-4">

        {/* IMAGE */}
        {imageUrl && (
          <div className="w-[140px] h-[80px] bg-gray-100 flex-shrink-0 overflow-hidden rounded">
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 space-y-2">

          {/* META */}
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{formattedDate || ""}</span>

            <span
              className={`
                text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium
                ${
                  isNews
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }
              `}
            >
              {isNews ? "NEWS" : "ANALYSIS"}
            </span>
          </div>

          {/* COMPANY */}
          {item.company?.name && (
            <div className="text-xs text-gray-500">
              {item.company.name}
            </div>
          )}

          {/* BADGES */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <button
                  key={`${b.label}-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (onClickBadge) {
                      onClickBadge(b);
                    }
                  }}
                  className={`
                    px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide
                    ${getBadgeClass(b.type)}
                    hover:opacity-80 transition
                  `}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* TITLE */}
          <h2 className="text-[15px] font-medium leading-snug">
            {item.title}
          </h2>

          {/* EXCERPT */}
          {item.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.excerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
