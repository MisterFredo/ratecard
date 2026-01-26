"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;

  topic?: string;
  onOpen?: (id: string) => void;
};

export default function AnalysisTeaserCard({
  id,
  title,
  excerpt,
  publishedAt,
  topic,
  onOpen,
}: Props) {
  return (
    <article
      onClick={() => onOpen?.(id)}
      className="
        cursor-pointer
        rounded-2xl
        border border-gray-200
        bg-slate-50
        p-5
        transition
        hover:border-gray-300
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* =====================================================
          BADGE — ANALYSE
      ===================================================== */}
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ratecard-blue">
        Analyse Ratecard
      </div>

      {/* =====================================================
          DATE
      ===================================================== */}
      <div className="mb-2 text-xs text-gray-400">
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* =====================================================
          EXCERPT (COURT)
      ===================================================== */}
      {excerpt && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {excerpt}
        </p>
      )}

      {/* =====================================================
          TOPIC (OPTIONNEL)
      ===================================================== */}
      {topic && (
        <div className="mt-4">
          <span className="inline-block px-2 py-0.5 rounded bg-white text-xs text-gray-600 border">
            {topic}
          </span>
        </div>
      )}
    </article>
  );
}
