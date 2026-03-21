"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

/* =========================================================
   TYPES
========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at: string;
};

type SolutionData = {
  id_solution: string;
  name: string;
  items: FeedItem[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function SolutionDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    leftDrawer,
    openRightDrawer,
    closeLeftDrawer,
  } = useDrawer();

  const [data, setData] = useState<SolutionData | null>(null);
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
      pathname.startsWith("/solutions")
    ) {
      router.push("/solutions", { scroll: false });
    }
  }

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/solution/${id}/view`);
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
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-start justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {data.name}
          </h1>

          <button onClick={close} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div className="px-6 py-8 space-y-10">

          {/* CONTENUS */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Contenus liés
            </h2>

            {data.items.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun contenu disponible pour cette solution.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.items.map((item) => (
                  <li
                    key={item.id}
                    onClick={() =>
                      openRightDrawer(
                        item.type === "news"
                          ? "news"
                          : "analysis",
                        item.id,
                        "silent"
                      )
                    }
                    className="
                      cursor-pointer p-4 rounded-lg
                      border border-gray-200
                      hover:bg-gray-50 transition
                    "
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h3>

                      <span className="text-[10px] uppercase text-gray-400">
                        {item.type}
                      </span>
                    </div>

                    {item.excerpt && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(
                        item.published_at
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
