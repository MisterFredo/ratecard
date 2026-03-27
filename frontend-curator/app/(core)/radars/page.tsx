"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useDrawer } from "@/contexts/DrawerContext";

import RadarCard from "@/components/radars/RadarCard";
import RadarSelectionPanel from "@/components/radars/RadarSelectionPanel";
import RadarHeader from "@/components/radars/RadarHeader";

/* ========================================================= */

const FREQUENCY_ORDER = ["WEEKLY", "MONTHLY", "QUARTERLY"];

/* ========================================================= */

export default function RadarsPage() {
  const LIMIT = 100;

  const { openRightDrawer } = useDrawer();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");

  /* SELECTION */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* ========================================================= */

  async function load(q?: string) {
    const finalQuery = (q ?? query)?.trim();

    setLoading(true);

    try {
      const res = await api.get(`/radar/feed?limit=${LIMIT}`)
          finalQuery ? `&query=${encodeURIComponent(finalQuery)}` : ""
        }`
      );

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

  /* =========================================================
     SELECTION
  ========================================================= */

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
     GROUPING
  ========================================================= */

  const grouped: Record<string, Record<string, any[]>> = {};

  items.forEach((item) => {
    const freq = item.FREQUENCY || "OTHER";
    const entity = item.ENTITY_LABEL || "Autres";

    if (!grouped[freq]) grouped[freq] = {};
    if (!grouped[freq][entity]) grouped[freq][entity] = [];

    grouped[freq][entity].push(item);
  });

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="xl:col-span-2 space-y-12">

        {/* HEADER */}
        <RadarHeader
          query={query}
          setQuery={setQuery}
          onSearch={() => load(query)}
        />

        {/* COUNT */}
        <div className="text-xs text-gray-400">
          {items.length} veilles
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : (
          FREQUENCY_ORDER.map((freq) => {
            const entities = grouped[freq];
            if (!entities) return null;

            return (
              <section key={freq} className="space-y-6">

                {/* FREQUENCY HEADER */}
                <div className="text-xs font-semibold uppercase text-gray-400">
                  {freq}
                </div>

                {Object.entries(entities).map(([entity, items]) => (

                  <div key={entity} className="space-y-3">

                    {/* ENTITY HEADER */}
                    <div className="text-sm font-semibold text-gray-900">
                      {entity}
                    </div>

                    {/* CARDS */}
                    <div className="
                      grid
                      grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                      gap-4
                    ">
                      {items.map((item: any) => {
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

                  </div>

                ))}

              </section>
            );
          })
        )}

      </div>

      {/* RIGHT PANEL */}
      {isPanelOpen && (
        <div
          className="
            xl:col-span-1
            sticky top-6
            h-[calc(100vh-120px)]
          "
        >
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
