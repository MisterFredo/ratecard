"use client";

type OpenMode = "test" | "external";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;

  topic?: string;
  keyMetric?: string;

  mode?: OpenMode; // ⬅️ clé
  onOpenTest?: (id: string) => void; // drawer ou page test
};

export default function AnalysisTeaserCard({
  id,
  title,
  excerpt,
  publishedAt,
  topic,
  keyMetric,
  mode = "test",
  onOpenTest,
}: Props) {
  function handleClick() {
    if (mode === "test") {
      onOpenTest?.(id);
      return;
    }

    // mode futur (Curator live)
    window.location.href = `https://getcurator.ai/analysis/${id}`;
  }

  return (
    <article
      onClick={handleClick}
      className="
        cursor-pointer
        rounded-2xl
        border border-dashed
        bg-white
        p-5
        transition
        hover:border-gray-400
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* META */}
      <div className="text-xs text-gray-400 mb-2">
        Analyse · {new Date(publishedAt).toLocaleDateString("fr-FR")}
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

      {/* FOOTER */}
      <div className="mt-auto pt-4 space-y-2 text-xs text-gray-600">
        {keyMetric && <div className="font-medium">• {keyMetric}</div>}

        {topic && (
          <span className="inline-block px-2 py-0.5 rounded bg-ratecard-light">
            {topic}
          </span>
        )}

        <div className="pt-2 text-ratecard-blue font-medium">
          Lire l’analyse →
        </div>
      </div>
    </article>
  );
}
