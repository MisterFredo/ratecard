"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES
========================================================= */

type MemberData = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;
  news: {
    id_news: string;
    title: string;
    excerpt?: string | null;
    published_at: string;
  }[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function MemberDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const { openDrawer } = useDrawer();

  const [data, setData] = useState<MemberData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------------------------------------------------
     Fermeture du drawer (gauche)
     → nettoyage URL
  --------------------------------------------------------- */
  function close() {
    setIsOpen(false);

    if (onClose) {
      onClose();
    }

    router.push("/members", { scroll: false });
  }

  /* ---------------------------------------------------------
     Chargement du partenaire + news associées
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/public/member/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, [id]);

  if (!data) return null;

  const visualUrl = data.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.media_logo_rectangle_id}`
    : null;

  return (
    <div className="fixed inset-0 z-[90] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={close}
      />

      {/* DRAWER GAUCHE */}
      <aside
        className={`
          relative mr-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {data.name}
          </h1>

          <button
            onClick={close}
            aria-label="Fermer"
            className="mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* VISUEL */}
        {visualUrl && (
          <img
            src={visualUrl}
            alt={data.name}
            className="
              w-full
              h-auto
              max-h-[300px]
              object-cover
            "
          />
        )}

        {/* CONTENT */}
        <div className="px-5 py-6 space-y-8">
          {/* DESCRIPTION */}
          {data.description && (
            <p className="text-base text-gray-800">
              {data.description}
            </p>
          )}

          {/* NEWS DU PARTENAIRE */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Actualités
            </h2>

            {data.news.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucune news publiée pour ce partenaire.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.news.map((n) => (
                  <li
                    key={n.id_news}
                    onClick={() => {
                      router.push(
                        `/members?member_id=${id}`,
                        { scroll: false }
                      );
                      openDrawer("news", n.id_news);
                    }}
                    className="
                      cursor-pointer p-3 rounded border border-gray-200
                      hover:bg-gray-50 transition
                    "
                  >
                    <h3 className="text-sm font-medium text-gray-900">
                      {n.title}
                    </h3>

                    {n.excerpt && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {n.excerpt}
                      </p>
                    )}

                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(
                        n.published_at
                      ).toLocaleDateString("fr-FR")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
