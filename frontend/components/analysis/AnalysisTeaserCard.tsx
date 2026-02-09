"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;

  // Accroche éditoriale
  topic?: string;

  // Comportement
  mode?: "test" | "external";

  // TEST uniquement (drawer Curator)
  onOpenTest?: (id: string) => void;
};

export default function AnalysisTeaserCard({
  id,
  title,
  excerpt,
  publishedAt,
  topic,
  mode = "test",
  onOpenTest,
}: Props) {
  function handleClick() {
    if (mode === "test") {
      onOpenTest?.(id);
      return;
    }

    // MODE EXTERNAL — redirection Curator
    const curatorBase =
      process.env.NEXT_PUBLIC_CURATOR_URL ||
      "https://getcurator.ai";

    window.open(
      `${curatorBase}/analysis/${id}`,
      "_blank"
    );
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
        hover:border-gray-300
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* =====================================================
          META — DATE
      ===================================================== */}
      <div className="mb-2 text-xs text-gray-400">
        Analyse •{" "}
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
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
        <p className="text-sm text-gray-600 mt-2 line-clamp-8">
          {excerpt}
        </p>
      )}

      {/* =====================================================
          FOOTER — CONTEXTE
      ===================================================== */}
      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
        {topic && (
          <span className="inline-block px-2 py-0.5 rounded bg-ratecard-light">
            {topic}
          </span>
        )}

        <span className="italic">
          Lire l’analyse →
        </span>
      </div>
    </article>
  );
}
