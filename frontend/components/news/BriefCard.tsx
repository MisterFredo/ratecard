"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  publishedAt: string;

  // optionnel pour plus tard
  typeLabel?: string; // ex: "Marché", "Client", "Nomination"
  onClick?: (id: string) => void;
};

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

export default function BriefCard({
  id,
  title,
  excerpt,
  publishedAt,
  typeLabel,
  onClick,
}: Props) {
  function handleClick() {
    onClick?.(id);
  }

  return (
    <article
      onClick={handleClick}
      className="
        cursor-pointer
        rounded-2xl
        border border-gray-200
        bg-gray-50
        p-5
        transition
        hover:bg-white
        hover:shadow-sm
        flex flex-col
      "
    >
      {/* =====================================================
          META — DATE + TYPE
      ===================================================== */}
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
        <span>Brève</span>

        {typeLabel && (
          <>
            <span>•</span>
            <span className="uppercase tracking-wide">
              {typeLabel}
            </span>
          </>
        )}

        {isValidDate(publishedAt) && (
          <>
            <span>•</span>
            <span>
              {new Date(publishedAt).toLocaleDateString("fr-FR")}
            </span>
          </>
        )}
      </div>

      {/* =====================================================
          TITLE
      ===================================================== */}
      <h3 className="text-sm font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* =====================================================
          EXCERPT
      ===================================================== */}
      {excerpt && (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-8">
          {excerpt}
        </p>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <div className="mt-auto pt-4 text-xs text-gray-400 italic">
        Voir toutes les brèves →
      </div>
    </article>
  );
}
