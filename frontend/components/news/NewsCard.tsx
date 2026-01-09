"use client";

import Link from "next/link";

type Props = {
  id: string;
  title: string;
  visualRectUrl: string;
  publishedAt: string;
};

export default function NewsCard({
  id,
  title,
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
      {/* VISUEL — REPÈRE, PAS HERO */}
      <div className="mb-3">
        <div className="h-24 rounded-xl bg-ratecard-light flex items-center justify-center overflow-hidden">
          <img
            src={visualRectUrl}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* TITRE — ÉLÉMENT PRINCIPAL */}
      <h3 className="
        text-sm font-semibold leading-snug text-gray-900
        group-hover:underline
      ">
        {title}
      </h3>

      {/* META */}
      <p className="mt-2 text-xs text-gray-400">
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </p>
    </Link>
  );
}
