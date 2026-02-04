"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  id: string;
  title: string;
  excerpt?: string | null;

  visualRectId?: string | null;          // NEWS
  companyVisualRectId?: string | null;   // FALLBACK SOCIÉTÉ

  companyName?: string;
  isPartner?: boolean;

  publishedAt: string;
  openInDrawer?: boolean;
  variant?: "default" | "featured";
};

function isValidDate(value?: string) {
  return !!value && !isNaN(Date.parse(value));
}

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectId,
  companyVisualRectId,
  companyName,
  isPartner = false,
  publishedAt,
  openInDrawer = false,
  variant = "default",
}: Props) {
  const { openRightDrawer } = useDrawer();
  const router = useRouter();
  const pathname = usePathname();

  const fromInternalClick = useRef(false);
  const isFeatured = variant === "featured";

  /* ---------------------------------------------------------
     VISUEL — PRIORITÉ NEWS > SOCIÉTÉ
  --------------------------------------------------------- */
  const visualSrc = visualRectId
    ? `${GCS_BASE_URL}/news/${visualRectId}`
    : companyVisualRectId
    ? `${GCS_BASE_URL}/companies/${companyVisualRectId}`
    : null;

  const isCompanyFallback = !visualRectId && !!companyVisualRectId;

  function openNews() {
    if (fromInternalClick.current) return;

    openRightDrawer("news", id);
    router.replace(`${pathname}?news_id=${id}`, { scroll: false });
  }

  const borderClass = isPartner
    ? "border-ratecard-blue"
    : "border-ratecard-border";

  const imageClass = isCompanyFallback
    ? "absolute inset-0 w-full h-full object-contain p-6"
    : "absolute inset-0 w-full h-full object-cover";

  /* ========================================================
     DRAWER MODE
  ======================================================== */
  if (openInDrawer) {
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
          <div className="relative w-full aspect-[3/2] overflow-hidden bg-ratecard-light">
            {visualSrc ? (
              <img src={visualSrc} alt={title} className={imageClass} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                Aucun visuel
              </div>
            )}
          </div>

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
        <div className="relative h-40 w-full overflow-hidden bg-ratecard-light">
          {visualSrc ? (
            <img src={visualSrc} alt={title} className={imageClass} />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
              Aucun visuel
            </div>
          )}
        </div>

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
     PUBLIC MODE
  ======================================================== */
  return (
    <article
      onClick={openNews}
      className={`
        group cursor-pointer overflow-hidden rounded-2xl
        bg-white shadow-card transition hover:shadow-cardHover
        border ${borderClass}
      `}
    >
      <div className="relative h-44 w-full bg-ratecard-light overflow-hidden">
        {visualSrc ? (
          <img
            src={visualSrc}
            alt={title}
            className={`${imageClass} transition-transform duration-300 group-hover:scale-[1.02]`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            Aucun visuel
          </div>
        )}
      </div>

      <div className="p-4">
        {companyName && (
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            {companyName}
          </div>
        )}

        <h3 className="text-sm font-semibold leading-snug text-gray-900 group-hover:underline">
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
      </div>
    </article>
  );
}
