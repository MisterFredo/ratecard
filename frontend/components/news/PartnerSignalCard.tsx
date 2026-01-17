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
    return (
      <article
        onClick={open}
        className={`
          group cursor-pointer overflow-hidden rounded-2xl
          border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover
          flex flex-col
          ${isFeatured ? "" : "h-full"}
        `}
      >
        {/* VISUEL — STRICTEMENT IDENTIQUE PARTOUT */}
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

        {/* CONTENU */}
        <div className="p-4 flex flex-col flex-1">
          {/* LABEL ÉDITORIAL — UNE */}
          {isFeatured && (
            <span className="text-xs uppercase tracking-wide text-gray-400">
              À la une
            </span>
          )}

          {/* TITRE */}
          <h3
            className={`
              mt-1 font-semibold text-gray-900
              ${isFeatured ? "text-lg leading-tight" : "text-sm leading-snug"}
            `}
          >
            {title}
          </h3>

          {/* EXCERPT */}
          {excerpt && (
            <p
              className={`
                mt-3 text-sm text-gray-600
                ${isFeatured ? "leading-relaxed line-clamp-6" : "line-clamp-3"}
              `}
            >
              {excerpt}
            </p>
          )}

          {/* DATE */}
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
