"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

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

  if (openInDrawer) {
    return (
      <article
        onClick={open}
        className="
          group cursor-pointer overflow-hidden rounded-2xl
          border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover
          h-full flex flex-col
        "
      >
        {/* VISUEL — RECTANGLE STRICT */}
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

        {/* CONTENU — LE TEXTE FAIT LA HIÉRARCHIE */}
        <div className="p-4 flex flex-col flex-1">
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
                mt-2 text-sm text-gray-600
                ${isFeatured ? "line-clamp-6" : "line-clamp-3"}
              `}
            >
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

  /* fallback navigation inchangé */
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
