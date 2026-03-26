"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import NumberCard from "@/components/numbers/NumberCard";
import SelectionPanel from "@/components/insight/SelectionPanel";

/* ========================================================= */

export default function NumbersPage() {
  const LIMIT = 100;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");

  /* SELECTION */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /* ANALYSIS */
  const [analysis, setAnalysis] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

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
    setSelectedIds((prev) =>
      prev.includes(item.ID_NUMBER)
        ? prev.filter((i) => i !== item.ID_NUMBER)
        : [...prev, item.ID_NUMBER]
    );

    setIsPanelOpen(true);
    setAnalysis("");
  }

  /* =========================================================
     ANALYSIS
  ========================================================= */

  async function generateInsight() {
    if (!selectedIds.length) return;

    setLoadingInsight(true);

    try {
      const res: any = await api.post("/insight/", {
        ids: selectedIds,
      });

      setAnalysis(res.insight || "");

    } catch (e) {
      console.error("❌ generateInsight error", e);
    } finally {
      setLoadingInsight(false);
    }
  }

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT → GRID */}
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
                  onClick={() => toggleSelect(item)}
                  selected={selected}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      {isPanelOpen && (
        <div className="
          xl:col-span-1
          sticky top-6
          h-[calc(100vh-120px)]
        ">
          <SelectionPanel
            items={items}
            selectedIds={selectedIds}
            analysis={analysis}
            loading={loadingInsight}
            onGenerateInsight={generateInsight}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
