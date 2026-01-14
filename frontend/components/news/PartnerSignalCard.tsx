"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  /* ========================================================
     MODE DRAWER (HOME / NEWS PAGE)
     → ouverture drawer + synchro URL
  ======================================================== */
  if (openInDrawer) {
    return (
      <div
        onClick={() => {
          router.push(`/news?news_id=${id}`, { scroll: false });
          openDrawer("news", id);
        }}
        className="
          group cursor-pointer rounded-2xl border border-ratecard-border
          bg-white shadow-card transition
          hover:shadow-cardHover overflow-hidden
        "
      >
        {/* VISUEL — PLUS GRAND, STRUCTURANT */}
        <div className="relative h-44 w-full bg-ratecard-light overflow-hidden">
          <img
            src={visualRectUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
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
     → redirection URL simple
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
      {/* VISUEL — COHÉRENT AVEC MODE DRAWER */}
      <div className="relative h-44 w-full bg-ratecard-light overflow-hidden">
        <img
          src={visualRectUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

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

