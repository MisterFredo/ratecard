"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useDrawer } from "@/contexts/DrawerContext";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";
import FeedGroupedByMonth from "@/components/feed/FeedGroupedByMonth";

/* ========================================================= */

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

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

type Radar = {
  id_insight: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  key_points: string[];
};

type SolutionData = {
  id_solution: string;
  name: string;

  company_name?: string;
  media_logo_rectangle_id?: string | null;
  is_partner?: boolean;

  nb_analyses?: number;
  delta_30d?: number;

  items?: FeedItem[];
};

type Props = {
  id: string;
  onClose?: () => void;
};

/* =========================================================
   HELPERS
========================================================= */

function formatRadarLabel(r: Radar) {
  if (r.frequency === "MONTHLY") {
    const date = new Date(r.year, r.period - 1);
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (r.frequency === "QUARTERLY") {
    return `T${r.period} ${r.year}`;
  }

  if (r.frequency === "WEEKLY") {
    return `Semaine ${r.period} ${r.year}`;
  }

  return "";
}

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
        const res = await api.get(
          `/solution/${id}/view?limit=20&offset=0`
        );

        setData(res);
        setItems(res.items ?? []);
        setOffset(20);
      } catch (e) {
        console.error("❌ SolutionDrawer load error", e);
      }
    }

    load();
  }, [id]);

  /* =========================================================
     LOAD RADAR
  ========================================================= */

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await api.get(
          `/radar/latest?entity_type=solution&entity_id=${id}`
        );

        setLastRadar(res?.insight ?? null);
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
        `/solution/${id}/view?limit=20&offset=${offset}`
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
        title={data.name}
        subtitle={data.company_name}
        logoId={data.media_logo_rectangle_id}
        variant="solution"
        nbAnalyses={data.nb_analyses}
        delta30d={data.delta_30d}
        onClose={close}
      />

      {/* CONTENT */}
      <div className="px-6 py-8 space-y-10">

        {/* =====================================================
            RADAR
        ===================================================== */}
        {lastRadar && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase text-gray-500">
              Veille
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
              <div className="text-xs text-gray-500 mb-2">
                {formatRadarLabel(lastRadar)}
              </div>

              <div className="text-sm font-medium text-gray-900 space-y-1">
                {lastRadar.key_points?.slice(0, 2).map((p, i) => (
                  <div key={i}>• {p}</div>
                ))}
              </div>

              <div className="text-xs text-gray-400 mt-3">
                Voir la veille complète →
              </div>
            </button>
          </section>
        )}

        {/* =====================================================
            FEED
        ===================================================== */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500">
            Contenus liés
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun contenu disponible pour cette solution.
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
