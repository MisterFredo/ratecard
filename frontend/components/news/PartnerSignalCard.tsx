"use client";

import Link from "next/link";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  visualRectUrl: string;
  publishedAt: string;
};

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectUrl,
  publishedAt,
}: Props) {
  return (
    <Link
      href={`/news/${id}`}
      className="
        group block rounded-2xl border border-ratecard-border
        bg-white p-4 shadow-card transition
        hover:shadow-cardHover
      "
    >
      {/* VISUEL — SIGNATURE PARTENAIRE */}
      <div className="h-20 mb-4 rounded-xl bg-ratecard-light flex items-center justify-center overflow-hidden">
        <img
          src={visualRectUrl}
          alt={title}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* TITRE */}
      <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
        {title}
      </h3>

      {/* EXCERPT — VALEUR RATECARD */}
      {excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {excerpt}
        </p>
      )}

      {/* META */}
      <div className="mt-3 text-xs text-gray-400">
        Publié le{" "}
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </div>
    </Link>
  );
}
