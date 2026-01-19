"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES
========================================================= */

type NewsData = {
  id_news: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  published_at?: string | null;

  visual_rect_url?: string | null;

  company?: {
    name: string;
    media_logo_rectangle_id?: string | null;
  };
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

function isValidDate(value?: string | null) {
  return !!value && !isNaN(Date.parse(value));
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { rightDrawer, closeRightDrawer } = useDrawer();

  const [data, setData] = useState<NewsData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------------------------------------------------
     FERMETURE DU DRAWER
  --------------------------------------------------------- */
  function close() {
    setIsOpen(false);
    onClose?.();
    closeRightDrawer();

    if (
      rightDrawer.mode === "route" &&
      pathname.startsWith("/news")
    ) {
      router.push("/news", { scroll: false });
    }
  }

  /* ---------------------------------------------------------
     CHARGEMENT DE LA NEWS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/news/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  if (!data) return null;

  /* ---------------------------------------------------------
     VISUEL — PRIORITÉ NEWS > SOCIÉTÉ
  --------------------------------------------------------- */
  const visualSrc = data.visual_rect_url
    ? `${GCS_BASE_URL}/news/${data.visual_rect_url}`
    : data.company?.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.company.media_logo_rectangle_id}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between">
          <div>
            {data.company?.name && (
              <div className="text-xs uppercase tracking-wide text-gray-400">
                {data.company.name}
              </div>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {data.title}
            </h1>
          </div>

          <button onClick={close}>
            <X size={18} />
          </button>
        </div>

        {/* VISUEL */}
        {visualSrc && (
          <img
            src={visualSrc}
            alt={data.title}
            className="w-full max-h-[340px] object-cover"
          />
        )}

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">
          {data.excerpt && (
            <p className="text-base font-medium text-gray-800 max-w-2xl">
              {data.excerpt}
            </p>
          )}

          {data.body && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: data.body }}
            />
          )}

          {isValidDate(data.published_at) && (
            <div className="pt-4 border-t text-xs text-gray-400">
              Publié le{" "}
              {new Date(data.published_at!).toLocaleDateString("fr-FR")}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
