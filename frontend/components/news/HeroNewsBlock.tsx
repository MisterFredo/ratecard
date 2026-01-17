"use client";

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
};

export default function HeroNewsBlock({
  id,
  title,
  excerpt,
  visualRectUrl,
  companyVisualRectId,
  publishedAt,
}: Props) {
  const router = useRouter();
  const { openRightDrawer } = useDrawer();

  const visualSrc = visualRectUrl
    ? `${GCS_BASE_URL}/news/${visualRectUrl}`
    : companyVisualRectId
    ? `${GCS_BASE_URL}/companies/${companyVisualRectId}`
    : null;

  function open() {
    router.push(`/news?news_id=${id}`, { scroll: false });
    openRightDrawer("news", id);
  }

  return (
    <article
      onClick={open}
      className="
        cursor-pointer overflow-hidden rounded-2xl
        border border-ratecard-border bg-white shadow-card
        hover:shadow-cardHover transition
      "
    >
      {/* VISUEL — RATIO ÉDITORIAL FIXE */}
      <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
        {visualSrc && (
          <img
            src={visualSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* CONTENU */}
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold leading-tight text-gray-900">
          {title}
        </h1>

        {excerpt && (
          <p className="text-base text-gray-700 max-w-3xl">
            {excerpt}
          </p>
        )}

        <div className="text-xs text-gray-400">
          Publié le{" "}
          {new Date(publishedAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
    </article>
  );
}
