"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useDrawer } from "@/contexts/DrawerContext";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";
import FeedGroupedByMonth from "@/components/feed/FeedGroupedByMonth";

/* =========================================================
   TYPES
========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at?: string;

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

type Radar = {
  id_insight: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  key_points: string[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

function getRadarLabel(r: Radar) {
  if (r.frequency === "MONTHLY") {
    return `Mois ${r.period} · ${r.year}`;
  }
  if (r.frequency === "QUARTERLY") {
    return `Trimestre ${r.period} · ${r.year}`;
  }
  if (r.frequency === "WEEKLY") {
    return `Semaine ${r.period} · ${r.year}`;
  }
  return "";
}

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

  const [lastRadar, setLastRadar] = useState<Radar | null>(null);

  /* =========================================================
     CLOSE
  ========================================================= */

  function close() {
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
     LOAD DATA
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
      } catch (e) {
        console.error("❌ TopicDrawer load error", e);
      }
    }

    load();
  }, [id]);

  /* =========================================================
     LOAD LAST RADAR
  ========================================================= */

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await api.get(
          `/radar/list?entity_type=topic&entity_id=${id}`
        );

        if (res && res.length > 0) {
          setLastRadar(res[0]); // 👉 le plus récent (déjà trié backend)
        }
      } catch (e) {
        console.error("❌ Radar load error", e);
      }
    }

    loadRadar();
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
     RENDER
  ========================================================= */

  return (
    <EntityDrawerLayout onClose={close}>

      {/* HEADER */}
      <DrawerHeader
        title={data.label || "Topic"}
        subtitle={data.topic_axis}
        variant="topic"
        nbAnalyses={data.nb_analyses}
        delta30d={data.delta_30d}
        onClose={close}
      />

      {/* CONTENT */}
      <div className="px-6 py-8 space-y-10">

        {/* =====================================================
            RADAR (NOUVEAU)
        ===================================================== */}
        {lastRadar && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Synthèse
            </h2>

            <button
              onClick={() =>
                openRightDrawer("radar", lastRadar.id_insight)
              }
              className="
                w-full text-left
                p-4 rounded border border-gray-200
                hover:bg-gray-50 transition
              "
            >
              <div className="text-xs text-gray-500 mb-1">
                {getRadarLabel(lastRadar)}
              </div>

              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                {lastRadar.key_points?.[0]}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Voir la synthèse complète →
              </div>
            </button>
          </section>
        )}

        {/* =====================================================
            FEED (INCHANGÉ)
        ===================================================== */}
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
              <FeedGroupedByMonth
                items={items}
                onClickItem={(item) =>
                  openRightDrawer(
                    item.type === "news"
                      ? "news"
                      : "analysis",
                    item.id,
                    "silent"
                  )
                }
              />

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

    </EntityDrawerLayout>
  );
}
