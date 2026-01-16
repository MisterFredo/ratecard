"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

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
};

export default function PartnerSignalCard({
  id,
  title,
  excerpt,
  visualRectUrl,
  companyVisualRectId,
  publishedAt,
  openInDrawer = false,
}: Props) {
  const { openRightDrawer } = useDrawer();
  const router = useRouter();

  /* ---------------------------------------------------------
     VISUEL — PRIORITÉ NEWS > SOCIÉTÉ
  --------------------------------------------------------- */
  const visualSrc = visualRectUrl
    ? `${GCS_BASE_URL}/news/${visualRectUrl}`
    : companyVisualRectId
    ? `${GCS_BASE_URL}/companies/${companyVisualRectId}`
    : null;

  /* ========================================================
     MODE DRAWER (HOME / NEWS PAGE)
  ======================================================== */
  if (openInDrawer) {
    return (
      <div
        onClick={() => {
          router.push(`/news?news_id=${id}`, { scroll: false });
          openRightDrawer("news", id);
        }}
        className="
          group cursor-pointer rounded-2xl border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover overflow-hidden
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
      </div>
    );
  }

  /* ========================================================
     MODE NAVIGATION (fallback / externe)
  ======================================================== */
  return (
    <Link
      href={`/news?news_id=${id}`}
      className="
        group block rounded-2xl border border-ratecard-border
        bg-white shadow-card transition
        hover:shadow-cardHover overflow-hidden
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
    </Link>
  );
}



