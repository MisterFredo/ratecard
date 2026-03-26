"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import NumberCard from "@/components/numbers/NumberCard";
import NumbersSelectionPanel from "@/components/numbers/NumbersSelectionPanel";

/* ========================================================= */

export default function NumbersPage() {
  const LIMIT = 100;

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
      const res = await api.get(
        `/numbers/feed?limit=${LIMIT}${
          finalQuery ? `&query=${encodeURIComponent(finalQuery)}` : ""
        }`
      );

      const data = res?.items ?? [];
      setItems(data);

    } catch (e) {
      console.error("❌ Numbers load error", e);
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
    const id = item.ID_NUMBER;

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );

    setIsPanelOpen(true);
  }

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="xl:col-span-2 space-y-6">

        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">
            Numbers
          </h1>

          <p className="text-sm text-gray-500">
            Explorez rapidement les indicateurs clés du marché.
          </p>

          <div className="text-xs text-gray-400">
            {items.length} chiffres
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un chiffre..."
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={() => load(query)}
            className="px-4 py-2 border rounded text-sm"
          >
            Rechercher
          </button>
        </div>

        {/* GRID */}
        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : (
          <div className="
            grid
            grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
            gap-3
          ">
            {items.map((item) => {
              const selected = selectedIds.includes(item.ID_NUMBER);

              return (
                <NumberCard
                  key={item.ID_NUMBER}
                  item={item}
                  selected={selected}
                  onClick={() => toggleSelect(item)}
                />
              );
            })}
          </div>
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
          <NumbersSelectionPanel
            items={items}
            selectedIds={selectedIds}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
