"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;

  // 🔥 NEW
  universe?: string;

  onOpen?: (id: string) => void;
};

export default function AnalysisCard({
  id,
  title,
  excerpt,
  publishedAt,
  universe,
  onOpen,
}: Props) {
  return (
    <article
      onClick={() => onOpen?.(id)}
      className="
        cursor-pointer
        rounded-2xl
        border
        bg-white
        p-5
        transition
        hover:border-gray-300
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* =====================================================
          META TOP — DATE + UNIVERSE
      ===================================================== */}
      <div className="mb-2 flex items-center justify-between">

        <div className="text-xs text-gray-400">
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </div>

        {universe && (
          <span className="
            text-[10px]
            px-2 py-0.5
            rounded
            bg-gray-100
            text-gray-600
            border
          ">
            {universe}
          </span>
        )}
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* =====================================================
          EXCERPT
      ===================================================== */}
      {excerpt && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {excerpt}
        </p>
      )}

    </article>
  );
}
