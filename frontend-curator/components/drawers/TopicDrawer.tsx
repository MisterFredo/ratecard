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
  published_at?: string;

  // 🔥 badges
  topics?: any[];
  companies?: any[];
  solutions?: any[];
  news_type?: string | null;
};

type TopicData = {
  id_topic: string;

  label?: string;
  topic_axis?: string;

  nb_analyses?: number;
  delta_30d?: number;

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
  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
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
     LOAD INITIAL
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(
          `/topic/${id}/view?limit=20&offset=0`
        );

        setData(res);
        setItems(res.items ?? []);
        setOffset(20);

        requestAnimationFrame(() => setIsOpen(true));
      } catch (e) {
        console.error("❌ TopicDrawer load error", e);
      }
    }

    load();
  }, [id]);

  /* =========================================================
     LOAD MORE
  ========================================================= */

  async function loadMore() {
    setLoadingMore(true);

    try {
      const res = await api.get(
        `/topic/${id}/view?limit=20&offset=${offset}`
      );

      const newItems = res.items ?? [];

      setItems((prev) => [...prev, ...newItems]);
      setOffset((prev) => prev + 20);

    } catch (e) {
      console.error("❌ loadMore error", e);
    }

    setLoadingMore(false);
  }

  if (!data) return null;

  /* =========================================================
     BADGES (IDENTIQUE FEEDROW)
  ========================================================= */

  function getBadgeClass(type?: string) {
    switch (type) {
      case "news_type":
        return "bg-black text-white";
      case "company":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "solution":
        return "bg-purple-50 text-purple-600 border border-purple-100";
      case "topic":
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function buildBadges(item: FeedItem) {
    const topics = Array.isArray(item.topics) ? item.topics : [];
    const companies = Array.isArray(item.companies) ? item.companies : [];
    const solutions = Array.isArray(item.solutions) ? item.solutions : [];

    return [
      ...(item.news_type
        ? [{ label: item.news_type, type: "news_type" as const }]
        : []),

      ...companies.map((c: any) => ({
        id: c.id_company,
        label: c.name,
        type: "company" as const,
      })),

      ...topics.map((t: any) => ({
        id: t.id_topic,
        label: t.label,
        type: "topic" as const,
      })),

      ...solutions.map((s: any) => ({
        id: s.id_solution,
        label: s.name,
        type: "solution" as const,
      })),
    ];
  }

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
            HEADER
        ===================================================== */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 space-y-2">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {data.label || "Topic"}
              </h1>

              {data.topic_axis && (
                <p className="text-sm text-gray-500">
                  {data.topic_axis}
                </p>
              )}
            </div>

            <button onClick={close}>
              <X size={18} />
            </button>
          </div>

          {/* STATS */}
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

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Contenus liés
            </h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun contenu pour ce topic.
              </p>
            ) : (
              <>
                <ul className="space-y-3">
                  {items.map((item) => {
                    const badges = buildBadges(item);

                    return (
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
                        {/* HEADER */}
                        <div className="flex justify-between items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.title}
                          </h3>

                          <span
                            className={`
                              text-[10px] uppercase px-2 py-0.5 rounded-full
                              ${
                                item.type === "news"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-purple-50 text-purple-600 border border-purple-100"
                              }
                            `}
                          >
                            {item.type}
                          </span>
                        </div>

                        {/* BADGES */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {badges.map((b, i) => (
                              <span
                                key={`${b.type}-${b.id || b.label}-${i}`}
                                className={`
                                  px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide
                                  ${getBadgeClass(b.type)}
                                `}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* EXCERPT */}
                        {item.excerpt && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {item.excerpt}
                          </p>
                        )}

                        {/* DATE */}
                        {item.published_at && (
                          <div className="mt-1 text-xs text-gray-400">
                            {new Date(
                              item.published_at
                            ).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* LOAD MORE */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMore}
                    className="
                      text-xs px-4 py-2 rounded
                      border border-gray-200
                      hover:bg-gray-50
                    "
                  >
                    {loadingMore
                      ? "Chargement..."
                      : "Voir plus"}
                  </button>
                </div>
              </>
            )}
          </section>

        </div>
      </aside>
    </div>
  );
}
