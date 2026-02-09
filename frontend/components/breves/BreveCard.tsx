"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  publishedAt: string;

  // optionnel, pour plus tard
  type?: string; // nomination, acquisition, partenariat, etc.

  // comportement
  onClick?: (id: string) => void;
};

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

export default function BreveCard({
  id,
  title,
  excerpt,
  publishedAt,
  type,
  onClick,
}: Props) {
  return (
    <article
      onClick={() => onClick?.(id)}
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
      {/* META */}
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
        <span>Brève</span>

        {type && (
          <>
            <span>•</span>
            <span className="uppercase tracking-wide">
              {type}
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

      {/* TITLE */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* EXCERPT */}
      {excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-4">
          {excerpt}
        </p>
      )}

      {/* FOOTER */}
      {onClick && (
        <div className="mt-auto pt-4 text-xs text-gray-500 italic">
          Voir toutes les brèves →
        </div>
      )}
    </article>
  );
}
