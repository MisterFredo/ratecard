"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* =========================================================
   TYPES (aligné backend entity_service)
========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at?: string;
};

type CompanyData = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;

  // 🔥 stats
  nb_analyses?: number;
  delta_30d?: number;

  // 🔥 nouveau modèle
  items?: FeedItem[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CompanyDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    leftDrawer,
    openRightDrawer,
    closeLeftDrawer,
  } = useDrawer();

  const [data, setData] = useState<CompanyData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* =========================================================
     CLOSE
  ========================================================= */

  function close() {
    setIsOpen(false);
    onClose?.();
    closeLeftDrawer();

    if (
      leftDrawer.mode === "route" &&
      pathname.startsWith("/companies")
    ) {
      router.push("/companies", { scroll: false });
    }
  }

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/company/${id}`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, [id]);

  if (!data) return null;

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const items = data.items ?? [];

  const news = items.filter((i) => i.type === "news");
  const analyses = items.filter((i) => i.type === "analysis");

  const logoUrl = data.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.media_logo_rectangle_id}`
    : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[90] flex">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={close}
      />

      {/* DRAWER */}
      <aside
        className={`
          relative mr-auto w-full md:w-[760px]
          bg-white shadow-xl overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =====================================================
            HEADER + STATS
        ===================================================== */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 space-y-2">

          <div className="flex items-start justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {data.name}
            </h1>

            <button onClick={close}>
              <X size={18} />
            </button>
          </div>

          {/* 🔥 STATS */}
          <div className="flex gap-4 text-xs text-gray-500">
            {typeof data.nb_analyses === "number" && (
              <span>
                {data.nb_analyses} analyses
              </span>
            )}

            {typeof data.delta_30d === "number" && (
              <span className="text-teal-600">
                +{data.delta_30d} (30j)
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            LOGO
        ===================================================== */}
        {logoUrl && (
          <div className="w-full bg-white border-b border-gray-200 flex items-center justify-center">
            <div className="w-full max-w-[680px] h-[260px] flex items-center justify-center">
              <img
                src={logoUrl}
                alt={data.name}
                className="max-h-[85%] max-w-[85%] object-contain"
              />
            </div>
          </div>
        )}

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div className="px-6 py-8 space-y-12">

          {/* DESCRIPTION */}
          {data.description && (
            <div
              className="
                prose prose-sm max-w-none
                prose-p:my-4
                prose-ul:my-4
                prose-li:my-1
              "
              dangerouslySetInnerHTML={{
                __html: data.description,
              }}
            />
          )}

          {/* =====================================================
              NEWS
          ===================================================== */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Actualités
            </h2>

            {news.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucune actualité.
              </p>
            ) : (
              <ul className="space-y-3">
                {news.map((n) => (
                  <li
                    key={n.id}
                    onClick={() =>
                      openRightDrawer("news", n.id, "silent")
                    }
                    className="cursor-pointer p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <h3 className="text-sm font-medium">
                      {n.title}
                    </h3>

                    {n.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {n.excerpt}
                      </p>
                    )}

                    {n.published_at && (
                      <div className="text-xs text-gray-400">
                        {new Date(n.published_at).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* =====================================================
              ANALYSES
          ===================================================== */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Analyses
            </h2>

            {analyses.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucune analyse.
              </p>
            ) : (
              <ul className="space-y-3">
                {analyses.map((a) => (
                  <li
                    key={a.id}
                    onClick={() =>
                      openRightDrawer("analysis", a.id, "silent")
                    }
                    className="cursor-pointer p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <h3 className="text-sm font-medium">
                      {a.title}
                    </h3>

                    {a.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {a.excerpt}
                      </p>
                    )}

                    {a.published_at && (
                      <div className="text-xs text-gray-400">
                        {new Date(a.published_at).toLocaleDateString("fr-FR")}
                      </div>
                    )}
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
