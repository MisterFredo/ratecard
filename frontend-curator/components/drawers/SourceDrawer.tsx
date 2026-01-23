"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES
========================================================= */

type SourceData = {
  id_news: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  published_at: string;

  visual_rect_id?: string | null;

  company: {
    id_company: string;
    name: string;
    media_logo_rectangle_id?: string | null;
  };
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT — SOURCE DRAWER (CURATOR)
========================================================= */

export default function SourceDrawer({ id, onClose }: Props) {
  const { closeRightDrawer } = useDrawer();

  const [data, setData] = useState<SourceData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------------------------------------------------
     CLOSE
  --------------------------------------------------------- */
  function close() {
    setIsOpen(false);
    onClose?.();
    closeRightDrawer();
  }

  /* ---------------------------------------------------------
     LOAD SOURCE (NEWS)
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/news/${id}`);
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
     VISUAL — PRIORITÉ NEWS > SOCIÉTÉ
  --------------------------------------------------------- */
  const visualSrc = data.visual_rect_id
    ? `${GCS_BASE_URL}/news/${data.visual_rect_id}`
    : data.company?.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.company.media_logo_rectangle_id}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={close}
      />

      {/* DRAWER — DROITE */}
      <aside
        className={`
          relative ml-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <div className="space-y-1 max-w-xl">
            {/* SOURCE LABEL */}
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Source
            </div>

            <h1 className="text-xl font-semibold leading-tight text-gray-900">
              {data.title}
            </h1>
          </div>

          <button
            onClick={close}
            aria-label="Fermer"
            className="mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* VISUAL */}
        {visualSrc && (
          <img
            src={visualSrc}
            alt={data.title}
            className="
              w-full
              h-auto
              max-h-[340px]
              object-cover
            "
          />
        )}

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">
          {/* EXCERPT */}
          {data.excerpt && (
            <p className="text-base font-medium text-gray-800 max-w-2xl">
              {data.excerpt}
            </p>
          )}

          {/* BODY */}
          {data.body && (
            <div
              className="
                prose prose-sm max-w-none
                prose-p:my-4
                prose-ul:my-4
                prose-ol:my-4
                prose-li:my-1
                prose-strong:font-semibold
                prose-a:text-teal-700
                prose-a:no-underline
                hover:prose-a:underline
              "
              dangerouslySetInnerHTML={{
                __html: data.body,
              }}
            />
          )}

          {/* FOOTER */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Publication du{" "}
              {new Date(data.published_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
