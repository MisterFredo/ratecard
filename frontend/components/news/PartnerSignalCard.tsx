"use client";

import Link from "next/link";
import { useDrawer } from "@/contexts/DrawerContext";

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;
  visualRectUrl: string;
  publishedAt: string;

  // 🆕
  openInDrawer?: boolean;
};

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectUrl,
  publishedAt,
  openInDrawer = false,
}: Props) {
  const { openDrawer } = useDrawer();

  // --------------------------------------------
  // MODE DRAWER (HOME)
  // --------------------------------------------
  if (openInDrawer) {
    return (
      <div
        onClick={() => openDrawer("news", id)}
        className="
          group cursor-pointer rounded-2xl border border-ratecard-border
          bg-white p-4 shadow-card transition
          hover:shadow-cardHover
        "
      >
        {/* VISUEL */}
        <div className="h-20 mb-4 rounded-xl bg-ratecard-light flex items-center justify-center overflow-hidden">
          <img
            src={visualRectUrl}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
            {excerpt}
          </p>
        )}

        <div className="mt-3 text-xs text-gray-400">
          Publié le{" "}
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
    );
  }

  // --------------------------------------------
  // MODE NAVIGATION (NEWS PAGE, EXTERNE)
  // --------------------------------------------
  return (
    <Link
      href={`/news/${id}`}
      className="
        group block rounded-2xl border border-ratecard-border
        bg-white p-4 shadow-card transition
        hover:shadow-cardHover
      "
    >
      <div className="h-20 mb-4 rounded-xl bg-ratecard-light flex items-center justify-center overflow-hidden">
        <img
          src={visualRectUrl}
          alt={title}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
        {title}
      </h3>

      {excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {excerpt}
        </p>
      )}

      <div className="mt-3 text-xs text-gray-400">
        Publié le{" "}
        {new Date(publishedAt).toLocaleDateString("fr-FR")}
      </div>
    </Link>
  );
}
