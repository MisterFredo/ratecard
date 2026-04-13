"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;

  universe?: string; // 🔥 NEW

  topic?: string;
  keyMetric?: string;

  onOpen?: (id: string) => void;
};

export default function AnalysisCard({
  id,
  title,
  excerpt,
  publishedAt,
  universe,
  topic,
  keyMetric,
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
      {/* DATE */}
      <div className="mb-2 text-xs text-gray-400">
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </div>

      {/* TITLE */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* EXCERPT */}
      {excerpt && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {excerpt}
        </p>
      )}

      {/* 🔥 UNIVERSE BADGE */}
      {universe && (
        <div className="mt-3">
          <span className="inline-block px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700">
            {universe}
          </span>
        </div>
      )}

      {/* OPTIONAL META */}
      {(topic || keyMetric) && (
        <div className="mt-auto pt-4 space-y-2 text-xs text-gray-600">
          {keyMetric && (
            <div className="font-medium">
              • {keyMetric}
            </div>
          )}

          {topic && (
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {topic}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
