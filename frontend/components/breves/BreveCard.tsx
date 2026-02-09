"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  publishedAt: string;

  // catégorie éditoriale (NEWS_TYPE)
  type?: string; // CORPORATE, PARTENAIRE, etc.

  // comportement
  onClick?: () => void;
};

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

export default function BreveCard({
  title,
  excerpt,
  publishedAt,
  type,
  onClick,
}: Props) {
  return (
    <article
      onClick={onClick}
      className={`
        rounded-2xl
        border
        bg-white
        p-5
        transition
        hover:border-gray-300
        hover:shadow-sm
        flex flex-col
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* =====================================================
          META
      ===================================================== */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        {/* BADGE STRUCTURE */}
        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
          Brève
        </span>

        {/* BADGE TYPE ÉDITORIAL */}
        {type && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 uppercase tracking-wide text-gray-600">
            {type}
          </span>
        )}

        {/* DATE */}
        {isValidDate(publishedAt) && (
          <span className="text-gray-400">
            {new Date(publishedAt).toLocaleDateString("fr-FR")}
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
        <p className="mt-2 text-sm text-gray-600 line-clamp-4">
          {excerpt}
        </p>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}
      {onClick && (
        <div className="mt-auto pt-4 text-xs text-gray-500 italic">
          Voir toutes les brèves →
        </div>
      )}
    </article>
  );
}
