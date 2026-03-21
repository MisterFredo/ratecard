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

  /* =========================================================
     CLOSE (IDENTIQUE)
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
     LOAD INITIAL (IDENTIQUE)
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
     LOAD MORE (IDENTIQUE)
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
     DERIVED (IDENTIQUE)
  ========================================================= */

  const logoUrl = data.media_logo_rectangle_id
    ? `${GCS_BASE_URL}/companies/${data.media_logo_rectangle_id}`
    : null;

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
              {/* 🔥 GROUPING PAR MOIS */}
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

              {/* LOAD MORE (IDENTIQUE) */}
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
