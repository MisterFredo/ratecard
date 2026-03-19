"use client";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  item: FeedItem;
  onClick: () => void;
};

/* ========================================================= */

export default function FeedRow({ item, onClick }: Props) {
  const isNews = item.type === "news";

  const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL;

  const formattedDate = item.published_at
    ? new Date(item.published_at).toLocaleDateString("fr-FR")
    : null;

  /* =========================================================
     BADGES (STRUCTURATION)
  ========================================================= */

  const badges = item.badges || [];

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

        {/* ============================
           IMAGE (NEWS ONLY)
        ============================ */}
        {isNews && item.has_visual && item.media_id && (
          <div className="w-[140px] h-[80px] bg-gray-100 flex-shrink-0 overflow-hidden rounded">
            <img
              src={`${GCS_BASE_URL}/news/${item.media_id}`}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ============================
           CONTENT
        ============================ */}
        <div className="flex-1 space-y-2">

          {/* META */}
          <div className="flex justify-between text-[11px] text-gray-400">

            <span>{formattedDate || ""}</span>

            <span
              className={`
                uppercase tracking-wide font-medium
                ${isNews ? "text-blue-600" : "text-green-600"}
              `}
            >
              {isNews ? "NEWS" : "ANALYSIS"}
            </span>
          </div>

          {/* BADGES */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b: any, i: number) => (
                <span
                  key={i}
                  className={`
                    px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide
                    ${getBadgeClass(b.type)}
                  `}
                >
                  {b.label}
                </span>
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
