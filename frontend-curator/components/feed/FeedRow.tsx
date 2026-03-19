function FeedRow({
  item,
  onClick,
}: {
  item: FeedItem;
  onClick: () => void;
}) {
  const isNews = item.type === "news";

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
              src={`${process.env.NEXT_PUBLIC_GCS_BASE_URL}/news/${item.media_id}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ============================
           CONTENT
        ============================ */}
        <div className="flex-1 space-y-1.5">

          {/* META */}
          <div className="flex justify-between text-[11px] text-gray-400">

            <span>
              {item.published_at
                ? new Date(item.published_at).toLocaleDateString("fr-FR")
                : ""}
            </span>

            <span
              className={`uppercase tracking-wide ${
                isNews
                  ? "text-blue-600"
                  : "text-green-600"
              }`}
            >
              {isNews ? "NEWS" : "ANALYSIS"}
            </span>
          </div>

          {/* COMPANY (NEWS) */}
          {isNews && item.company && (
            <div className="text-xs font-medium text-gray-700">
              {item.company}
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

          {/* NEWS TYPE BADGE */}
          {isNews && item.news_type && (
            <div className="text-[10px] text-gray-400 uppercase">
              {item.news_type}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
