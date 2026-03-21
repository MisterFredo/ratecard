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

type CompanyData = {
  id_company: string;
  name: string;
  description?: string | null;
  media_logo_rectangle_id?: string | null;

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

export default function CompanyDrawer({ id, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    leftDrawer,
    openRightDrawer,
    closeLeftDrawer,
  } = useDrawer();

  const [data, setData] = useState<CompanyData | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  /* =========================================================
     CLOSE (STRICTEMENT IDENTIQUE)
  ========================================================= */

  function close() {
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
     LOAD INITIAL (STRICTEMENT IDENTIQUE)
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(
          `/company/${id}/view?limit=20&offset=0`
        );

        setData(res);
        setItems(res.items ?? []);
        setOffset(20);
      } catch (e) {
        console.error("❌ CompanyDrawer load error", e);
      }
    }

    load();
  }, [id]);

  /* =========================================================
     LOAD MORE (STRICTEMENT IDENTIQUE)
  ========================================================= */

  async function loadMore() {
    setLoadingMore(true);

    try {
      const res = await api.get(
        `/company/${id}/view?limit=20&offset=${offset}`
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
     DERIVED (STRICTEMENT IDENTIQUE)
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
        nbAnalyses={data.nb_analyses}
        delta30d={data.delta_30d}
        onClose={close}
      />

      {/* LOGO (STRICTEMENT CONSERVÉ) */}
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

      {/* CONTENT */}
      <div className="px-6 py-8 space-y-12">

        {/* DESCRIPTION */}
        {data.description && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: data.description,
            }}
          />
        )}

        {/* CONTENUS */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-500">
            Contenus liés
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun contenu.
            </p>
          ) : (
            <>
              {/* 🔥 NOUVEAU → GROUPING PAR MOIS */}
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

              {/* LOAD MORE (STRICTEMENT IDENTIQUE) */}
              <div className="flex justify-center pt-2">
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
