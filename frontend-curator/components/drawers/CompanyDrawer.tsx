"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useDrawer } from "@/contexts/DrawerContext";

import EntityDrawerLayout from "@/components/drawers/EntityDrawerLayout";
import DrawerHeader from "@/components/drawers/DrawerHeader";
import FeedGroupedByMonth from "@/components/feed/FeedGroupedByMonth";

/* ========================================================= */

type FeedItem = {
  id: string;
  type: "news" | "analysis";
  title: string;
  excerpt?: string | null;
  published_at?: string;
};

type Radar = {
  id_insight: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  key_points: string[];
};

type NumberItem = {
  id_number: string;
  label?: string;
  value?: number;
  unit?: string;
  scale?: string;
  zone?: string;
  period?: string;
};

type NumberType = {
  type: string;
  numbers: NumberItem[];
};

type NumberCategory = {
  category: string;
  types: NumberType[];
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

function formatValue(n: NumberItem) {
  if (!n.value) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[n.scale || ""] || "";
  const unit = n.unit || "";

  return `${n.value}${scale}${unit}`;
}

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

  const [lastRadar, setLastRadar] = useState<Radar | null>(null);
  const [numbers, setNumbers] = useState<NumberCategory[]>([]);

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

  /* LOAD DATA */
  useEffect(() => {
    async function load() {
      const res = await api.get(
        `/company/${id}/view?limit=20&offset=0`
      );

      setData(res);
      setItems(res.items ?? []);
      setOffset(20);
    }

    load();
  }, [id]);

  /* LOAD RADAR */
  useEffect(() => {
    async function loadRadar() {
      const res = await api.get(
        `/radar/latest?entity_type=company&entity_id=${id}`
      );

      setLastRadar(res?.insight ?? null);
    }

    loadRadar();
  }, [id]);

  /* LOAD NUMBERS */
  useEffect(() => {
    async function loadNumbers() {
      const res = await api.get(
        `/numbers/entity?entity_type=company&entity_id=${id}&limit=4`
      );

      setNumbers(res.items ?? []);
    }

    loadNumbers();
  }, [id]);

  async function loadMore() {
    setLoadingMore(true);

    const res = await api.get(
      `/company/${id}/view?limit=20&offset=${offset}`
    );

    setItems((prev) => [...prev, ...(res.items ?? [])]);
    setOffset((prev) => prev + 20);

    setLoadingMore(false);
  }

  if (!data) return null;

  return (
    <EntityDrawerLayout onClose={close}>

      {/* HEADER */}
      <DrawerHeader
        title={data.name}
        logoId={data.media_logo_rectangle_id}
        variant="company"
        nbAnalyses={data.nb_analyses}
        delta30d={data.delta_30d}
        onClose={close}
      />

      <div className="px-6 py-6 space-y-8">

        {/* DESCRIPTION */}
        {data.description && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        )}

        {/* NUMBERS */}
        {numbers.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase text-gray-400">
              Chiffres clés
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {numbers.map((cat) =>
                cat.types.map((t) =>
                  t.numbers.map((n) => (
                    <div
                      key={n.id_number}
                      className="p-3 border rounded"
                    >
                      {(n.zone || n.period) && (
                        <div className="text-[10px] text-gray-400 mb-1">
                          {[n.zone, n.period]
                            .filter(Boolean)
                            .join(" — ")}
                        </div>
                      )}

                      <div className="text-sm font-semibold text-gray-900">
                        {formatValue(n)}
                      </div>

                      {n.label && (
                        <div className="text-xs text-gray-500 mt-1">
                          {n.label}
                        </div>
                      )}
                    </div>
                  ))
                )
              )}
            </div>

            <button
              onClick={() =>
                openRightDrawer("numbers", id, "silent", {
                  entityType: "company",
                })
              }
              className="text-xs text-gray-400 hover:text-black"
            >
              Voir tous les chiffres →
            </button>
          </section>
        )}

        {/* RADAR */}
        {lastRadar && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase text-gray-400">
              Veille
            </h2>

            <button
              onClick={() =>
                openRightDrawer("radar", lastRadar.id_insight)
              }
              className="w-full text-left p-4 rounded border border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="text-xs text-gray-500 mb-2">
                {formatRadarLabel(lastRadar)}
              </div>

              <div className="text-sm text-gray-900 space-y-1">
                {lastRadar.key_points?.slice(0, 2).map((p, i) => (
                  <div key={i}>• {p}</div>
                ))}
              </div>

              <div className="text-xs text-gray-400 mt-3">
                Voir la veille complète →
              </div>
            </button>

            <button
              onClick={() =>
                openRightDrawer("radar_list", id, "silent", {
                  entityType: "company",
                })
              }
              className="text-xs text-gray-400 hover:text-black"
            >
              Voir toutes les veilles →
            </button>
          </section>
        )}

        {/* FEED */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase text-gray-400">
            Contenus liés
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucun contenu.
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

              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  className="text-xs px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
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
