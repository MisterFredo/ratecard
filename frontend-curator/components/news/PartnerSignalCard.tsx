"use client";

import { useRef } from "react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES
========================================================= */

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;

  /* 🔑 VISUEL NEWS UNIQUEMENT */
  visualRectId?: string | null;

  companyName?: string;
  isPartner?: boolean;

  publishedAt: string;
  openInDrawer?: boolean;
  variant?: "default" | "featured";
};

/* =========================================================
   HELPERS
========================================================= */

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

/* =========================================================
   COMPONENT — CURATOR
========================================================= */

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectId,
  companyName,
  isPartner = false,
  publishedAt,
  openInDrawer = false,
  variant = "default",
}: Props) {
  const { openDrawer } = useDrawer();
  const fromInternalClick = useRef(false);

  const isFeatured = variant === "featured";

  /* ---------------------------------------------------------
     VISUEL — NEWS UNIQUEMENT
  --------------------------------------------------------- */
  const visualSrc = visualRectId
    ? `${GCS_BASE_URL}/news/${visualRectId}`
    : null;

  /* ---------------------------------------------------------
     OUVERTURE NEWS — SOURCE DRAWER
  --------------------------------------------------------- */
  function openNews() {
    if (fromInternalClick.current) return;

    openDrawer("right", {
      type: "analysis",
      payload: {
        id,
        source: "news",
      },
    });
  }

  /* ---------------------------------------------------------
     FILET PARTENAIRE
  --------------------------------------------------------- */
  const borderClass = isPartner
    ? "border-ratecard-blue"
    : "border-ratecard-border";

  /* ========================================================
     MODE GRID / DRAWER
  ======================================================== */

  if (openInDrawer) {
    /* =====================================================
       UNE — CARTE FEATURED
    ===================================================== */
    if (isFeatured) {
      return (
        <article
          onClick={openNews}
          className={`
            group cursor-pointer overflow-hidden rounded-2xl
            bg-white shadow-card transition hover:shadow-cardHover
            border ${borderClass}
            h-full grid grid-rows-[auto_1fr]
          `}
        >
          {visualSrc && (
            <div className="relative w-full aspect-[3/2] overflow-hidden bg-ratecard-light p-2">
              <img
                src={visualSrc}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            </div>
          )}

          <div className="p-4 flex flex-col">
            {companyName && (
              <div className="text-xs uppercase tracking-wide text-gray-400">
                {companyName}
              </div>
            )}

            <h3 className="mt-1 text-lg font-semibold leading-tight text-gray-900">
              {title}
            </h3>

            {excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-4">
                {excerpt}
              </p>
            )}

            {isValidDate(publishedAt) && (
              <div className="mt-auto text-xs text-gray-400">
                Publié le{" "}
                {new Date(publishedAt).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>
        </article>
      );
    }

    /* =====================================================
       CARTES NEWS NORMALES
    ===================================================== */
    return (
      <article
        onClick={openNews}
        className={`
          group cursor-pointer overflow-hidden rounded-2xl
          bg-white shadow-card transition hover:shadow-cardHover
          border ${borderClass}
          h-full flex flex-col
        `}
      >
        {visualSrc && (
          <div className="relative h-40 w-full overflow-hidden bg-ratecard-light p-2">
            <img
              src={visualSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover rounded-lg"
            />
          </div>
        )}

        <div className="p-4 flex flex-col flex-1">
          {companyName && (
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              {companyName}
            </div>
          )}

          <h3 className="text-sm font-semibold leading-snug text-gray-900">
            {title}
          </h3>

          {excerpt && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {excerpt}
            </p>
          )}

          {isValidDate(publishedAt) && (
            <div className="mt-auto text-xs text-gray-400">
              Publié le{" "}
              {new Date(publishedAt).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </article>
    );
  }

  /* ========================================================
     MODE LISTE / DASHBOARD
     → TEXTE SEULEMENT
  ======================================================== */

  return (
    <article
      onClick={openNews}
      className={`
        cursor-pointer
        rounded-lg
        border
        bg-white
        p-4
        transition
        hover:border-gray-300
        hover:shadow-sm
      `}
    >
      {companyName && (
        <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
          {companyName}
        </div>
      )}

      <h3 className="text-sm font-semibold leading-snug text-gray-900">
        {title}
      </h3>

      {excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {excerpt}
        </p>
      )}

      {isValidDate(publishedAt) && (
        <div className="mt-3 text-xs text-gray-400">
          Publié le{" "}
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </div>
      )}
    </article>
  );
}
