"use client";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  publishedAt: string;
};

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

export default function BriefCard({
  id,
  title,
  excerpt,
  publishedAt,
}: Props) {
  function openBriefs() {
    // V1 : page dédiée aux brèves (scroll infini)
    window.location.href = `/briefs?from=${id}`;
  }

  return (
    <article
      onClick={openBriefs}
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
      {/* META */}
      {isValidDate(publishedAt) && (
        <div className="mb-2 text-xs text-gray-400">
          Brève •{" "}
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </div>
      )}

      {/* TITRE */}
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
      <div className="mt-auto pt-4 text-xs text-gray-500 italic">
        Voir toutes les brèves →
      </div>
    </article>
  );
}
