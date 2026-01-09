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
      className="group cursor-pointer block"
    >
      <div className="overflow-hidden rounded">
        <img
          src={visualRectUrl}
          alt={title}
          className="w-full h-36 object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <h3 className="mt-2 text-sm font-medium leading-snug group-hover:underline">
        {title}
      </h3>

      <p className="text-xs text-gray-400 mt-1">
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </p>
    </Link>
  );
}
