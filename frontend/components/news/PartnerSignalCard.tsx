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

  // visuel propre à la news (peut être null)
  visualRectUrl?: string | null;

  // visuel hérité de la société (peut être null)
  companyVisualRectId?: string | null;

  publishedAt: string;
  openInDrawer?: boolean;

  // VARIANTE ÉDITORIALE
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

  /* ---------------------------------------------------------
     VISUEL — PRIORITÉ NEWS > SOCIÉTÉ
  --------------------------------------------------------- */
  const visualSrc = visualRectUrl
    ? `${GCS_BASE_URL}/news/${visualRectUrl}`
    : companyVisualRectId
    ? `${GCS_BASE_URL}/companies/${companyVisualRectId}`
    : null;

  /* ---------------------------------------------------------
     HANDLER OUVERTURE
  --------------------------------------------------------- */
  function open() {
    router.push(`/news?news_id=${id}`, { scroll: false });
    openRightDrawer("news", id);
  }

  /* ========================================================
     MODE DRAWER (HOME / LISTING)
  ======================================================== */
  if (openInDrawer) {
    return (
      <article
        onClick={open}
        className="
          group cursor-pointer overflow-hidden rounded-2xl
          border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover
        "
      >
        {/* =====================================================
            VISUEL — RYTHME ÉDITORIAL CONTRÔLÉ
        ===================================================== */}
        <div
          className={`
            relative w-full overflow-hidden bg-ratecard-light
            ${isFeatured ? "aspect-[3/2]" : "h-44"}
          `}
        >
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

        {/* =====================================================
            CONTENU — MÊME PADDING, HIÉRARCHIE TEXTE
        ===================================================== */}
        <div className="p-4">
          <h3
            className={`
              font-semibold leading-snug text-gray-900
              ${isFeatured ? "text-base" : "text-sm"}
            `}
          >
            {title}
          </h3>

          {excerpt && (
            <p
              className={`
                mt-2 text-gray-600
                ${isFeatured ? "text-sm line-clamp-3" : "text-sm line-clamp-3"}
              `}
            >
              {excerpt}
            </p>
          )}

          <div className="mt-3 text-xs text-gray-400">
            Publié le{" "}
            {new Date(publishedAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
      </article>
    );
  }

  /* ========================================================
     MODE NAVIGATION (fallback / externe)
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
      {/* VISUEL */}
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

      {/* CONTENU */}
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
