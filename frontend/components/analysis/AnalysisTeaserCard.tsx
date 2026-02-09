"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  topic?: string;
  mode?: "test" | "external";
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

    const curatorBase =
      process.env.NEXT_PUBLIC_CURATOR_URL ||
      "https://getcurator.ai";

    window.open(`${curatorBase}/analysis/${id}`, "_blank");
  }

  return (
    <article
      onClick={handleClick}
      className="
        cursor-pointer
        rounded-2xl
        border border-dashed border-emerald-200
        bg-emerald-50/40
        p-5
        transition
        hover:border-emerald-300
        hover:bg-emerald-50
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* META */}
      <div className="mb-2 text-xs text-emerald-700/70">
        Analyse •{" "}
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </div>

      {/* TITLE */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* EXCERPT */}
      {excerpt && (
        <p className="text-sm text-gray-700 mt-2 line-clamp-8">
          {excerpt}
        </p>
      )}

      {/* FOOTER */}
      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
        {topic && (
          <span className="
            inline-block px-2 py-0.5 rounded
            bg-emerald-100 text-emerald-800
          ">
            {topic}
          </span>
        )}

        <span className="italic text-emerald-700">
          Lire l’analyse →
        </span>
      </div>
    </article>
  );
}
