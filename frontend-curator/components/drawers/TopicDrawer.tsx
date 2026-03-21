"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useDrawer } from "@/contexts/DrawerContext";

/* =========================================================
   TYPES (alignés backend VIEW)
========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at?: string;
};

type TopicData = {
  id_topic: string;

  // 🔥 enrichissement
  label?: string;
  topic_axis?: string;

  // 🔥 stats
  nb_analyses?: number;
  delta_30d?: number;

  // 🔥 contenu
  items?: FeedItem[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TopicDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    leftDrawer,
    openRightDrawer,
    closeLeftDrawer,
  } = useDrawer();

  const [data, setData] = useState<TopicData | null>(null);
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
      pathname.startsWith("/topics")
    ) {
      router.push("/topics", { scroll: false });
    }
  }

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/topic/${id}/view`);
        setData(res);
        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error("❌ TopicDrawer load error", e);
      }
    }

    load();
  }, [id]);

  if (!data) return null;

  /* =========================================================
     DERIVED
  ========================================================= */

  const items = data.items ?? [];

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
            HEADER + AXIS + STATS
        ===================================================== */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 space-y-2">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {data.label || "Topic"}
              </h1>

              {/* 🔥 axis */}
              {data.topic_axis && (
                <p className="text-xs text-gray-500 uppercase">
                  {data.topic_axis}
                </p>
              )}
            </div>

            <button onClick={close}>
              <X size={18} />
            </button>
          </div>

          {/* 🔥 stats */}
          <div className="flex gap-4 text-xs text-gray-500">
            {typeof data.nb_analyses === "number" && (
              <span>{data.nb_analyses} analyses</span>
            )}

            {typeof data.delta_30d === "number" && (
              <span className="text-teal-600">
                +{data.delta_30d} (30j)
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div className="px-6 py-8 space-y-10">

          {/* CONTENUS */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Contenus liés
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun contenu pour ce topic.
              </p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
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
                    <div className="flex justify-between items-center gap-2">
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

                    {item.published_at && (
                      <div className="mt-1 text-xs text-gray-400">
                        {new Date(
                          item.published_at
                        ).toLocaleDateString("fr-FR")}
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
