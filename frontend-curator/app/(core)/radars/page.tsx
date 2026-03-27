"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDrawer } from "@/contexts/DrawerContext";

import RadarCard from "@/components/radars/RadarCard";
import RadarSelectionPanel from "@/components/radars/RadarSelectionPanel";
import RadarHeader from "@/components/radars/RadarHeader";

/* ========================================================= */

const FREQUENCY_ORDER = ["WEEKLY", "MONTHLY", "QUARTERLY"];
const ENTITY_ORDER = ["company", "topic", "solution"];

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/* ========================================================= */

export default function RadarsPage() {
  const LIMIT = 200;

  const { openRightDrawer } = useDrawer();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<any>({});

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  /* ========================================================= */

  async function load(customFilters?: any) {
    const f = customFilters ?? filters;

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("limit", String(LIMIT));

      if (f.query) params.append("query", f.query);
      if (f.frequency) params.append("frequency", f.frequency);
      if (f.year) params.append("year", String(f.year));
      if (f.period_from) params.append("period_from", String(f.period_from));
      if (f.period_to) params.append("period_to", String(f.period_to));

      const res = await api.get(`/radar/feed?${params.toString()}`);
      setItems(res?.items ?? []);

    } catch (e) {
      console.error("❌ radar load error", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ========================================================= */

  function toggleSelect(item: any) {
    const id = item.ID_INSIGHT;

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );

    setIsPanelOpen(true);
  }

  /* =========================================================
     GROUPING (FREQ → TYPE → ENTITY)
  ========================================================= */

  const grouped: any = {};

  items.forEach((item) => {
    const freq = item.FREQUENCY || "OTHER";
    const type = item.ENTITY_TYPE || "other";
    const entity = item.ENTITY_LABEL || "Autres";

    if (!grouped[freq]) grouped[freq] = {};
    if (!grouped[freq][type]) grouped[freq][type] = {};
    if (!grouped[freq][type][entity]) grouped[freq][type][entity] = [];

    grouped[freq][type][entity].push(item);
  });

  /* ========================================================= */

  function getVisual(item: any) {
    if (
      item.ENTITY_TYPE === "company" ||
      item.ENTITY_TYPE === "solution"
    ) {
      return `${GCS_BASE_URL}/companies/${item.ENTITY_ID}`;
    }
    return null;
  }

  function renderEntityBlock(entity: string, items: any[]) {
    const sorted = [...items].sort(
      (a, b) =>
        (b.YEAR * 100 + b.PERIOD) -
        (a.YEAR * 100 + a.PERIOD)
    );

    const isExpanded = expanded[entity];
    const visibleItems = isExpanded ? sorted : sorted.slice(0, 3);

    const visual = getVisual(items[0]);

    return (
      <div key={entity} className="space-y-2">

        {/* HEADER */}
        <div className="flex items-center gap-2">

          {visual ? (
            <img
              src={visual}
              alt={entity}
              className="w-5 h-5 object-contain"
            />
          ) : (
            <div className="w-5 h-5 text-[9px] bg-gray-100 rounded flex items-center justify-center">
              {entity.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="text-xs font-semibold text-gray-900">
            {entity}
          </div>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleItems.map((item: any) => {
            const selected = selectedIds.includes(item.ID_INSIGHT);

            return (
              <RadarCard
                key={item.ID_INSIGHT}
                item={item}
                selected={selected}
                onClick={() => toggleSelect(item)}
                onOpenDrawer={() =>
                  openRightDrawer("radar", item.ID_INSIGHT)
                }
              />
            );
          })}
        </div>

        {/* SEE MORE */}
        {sorted.length > 3 && (
          <button
            onClick={() =>
              setExpanded((prev) => ({
                ...prev,
                [entity]: !prev[entity],
              }))
            }
            className="text-[11px] text-gray-400 hover:text-gray-700"
          >
            {isExpanded ? "Voir moins ↑" : "Voir plus →"}
          </button>
        )}

      </div>
    );
  }

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* LEFT */}
      <div className="xl:col-span-2 space-y-8">

        <RadarHeader
          query={query}
          setQuery={setQuery}
          onSearch={(f) => {
            setFilters(f || {});
            load(f);
          }}
        />

        <div className="text-xs text-gray-400">
          {items.length} veilles
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : (
          FREQUENCY_ORDER.map((freq) => {
            const freqBlock = grouped[freq];
            if (!freqBlock) return null;

            return (
              <section key={freq} className="space-y-4">

                <div className="text-[11px] font-semibold uppercase text-gray-400">
                  {freq}
                </div>

                {ENTITY_ORDER.map((type) => {
                  const entities = freqBlock[type];
                  if (!entities) return null;

                  return (
                    <div key={type} className="space-y-3">

                      {/* TYPE HEADER */}
                      <div className="text-[11px] text-gray-500 uppercase">
                        {type}
                      </div>

                      {Object.entries(entities).map(([entity, items]) =>
                        renderEntityBlock(entity, items as any[])
                      )}

                    </div>
                  );
                })}

              </section>
            );
          })
        )}

      </div>

      {/* RIGHT */}
      {isPanelOpen && (
        <div className="xl:col-span-1 sticky top-6 h-[calc(100vh-120px)]">
          <RadarSelectionPanel
            items={items}
            selectedIds={selectedIds}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
