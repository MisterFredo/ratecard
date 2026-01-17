"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES
========================================================= */

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;

  visualRectUrl?: string | null;
  companyVisualRectId?: string | null;

  publishedAt: string;
  openInDrawer?: boolean;
  variant?: "default" | "featured";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectUrl,
  companyVisualRectId,
  publishedAt,
  openInDrawer = false,
  variant = "default",
}: Props) {
  const { openRightDrawer } = useDrawer();
  const router = useRouter();

  const isFeatured = variant === "featured";

  const visualSrc = visualRectUrl
    ? `${GCS_BASE_URL}/news/${visualRectUrl}`
    : companyVisualRectId
    ? `${GCS_BASE_URL}/companies/${companyVisualRectId}`
    : null;

  function open() {
    router.push(`/news?news_id=${id}`, { scroll: false });
    openRightDrawer("news", id);
  }

  /* ========================================================
     MODE HOME / DRAWER
  ======================================================== */
  if (openInDrawer) {
    /* =====================================================
       UNE — CARTE x4 (GRID INTERNE STABLE)
    ===================================================== */
    if (isFeatured) {
      return (
        <article
          onClick={open}
          className="
            group cursor-pointer overflow-hidden rounded-2xl
            border border-ratecard-border
            bg-white shadow-card transition
            hover:shadow-cardHover
            h-full
            grid grid-rows-[auto_1fr]
          "
        >
          {/* IMAGE — RATIO STRICT */}
          <div className="relative w-full aspect-[3/2] overflow-hidden bg-ratecard-light">
            {visualSrc ? (
              <img
                src={visualSrc}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                Aucun visuel
              </div>
            )}
          </div>

          {/* TEXTE — REMPLIT LA 2e ZONE */}
          <div className="p-4 flex flex-col">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              À la une
            </span>

            <h3 className="mt-1 text-lg font-semibold leading-tight text-gray-900">
              {title}
            </h3>

            {excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-4">
                {excerpt}
              </p>
            )}

            <div className="mt-auto text-xs text-gray-400">
              Publié le{" "}
              {new Date(publishedAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </article>
      );
    }

    /* =====================================================
       CARTES NORMALES — 1x1 (INCHANGÉ)
    ===================================================== */
    return (
      <article
        onClick={open}
        className="
          group cursor-pointer overflow-hidden rounded-2xl
          border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover
          h-full
          flex flex-col
        "
      >
        {/* VISUEL */}
        <div className="relative h-40 w-full overflow-hidden bg-ratecard-light">
          {visualSrc ? (
            <img
              src={visualSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
              Aucun visuel
            </div>
          )}
        </div>

        {/* TEXTE */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold leading-snug text-gray-900">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {excerpt}
            </p>
          )}

          <div className="mt-auto text-xs text-gray-400">
            Publié le{" "}
            {new Date(publishedAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </article>
    );
  }

  /* ========================================================
     MODE NAVIGATION EXTERNE (INCHANGÉ)
  ======================================================== */
  return (
    <Link
      href={`/news?news_id=${id}`}
      className="
        group block overflow-hidden rounded-2xl
        border border-ratecard-border
        bg-white shadow-card transition
        hover:shadow-cardHover
      "
    >
      <div className="relative h-44 w-full bg-ratecard-light overflow-hidden">
        {visualSrc ? (
          <img
            src={visualSrc}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            Aucun visuel
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:underline">
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
    </Link>
  );
}
