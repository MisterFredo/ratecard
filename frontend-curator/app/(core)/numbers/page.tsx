"use client";

import { useState, useEffect } from "react";

import NumberDrawer from "@/components/drawers/NumberDrawer";
import NumberCard from "@/components/numbers/NumberCard";

import { api } from "@/lib/api";

/* ========================================================= */

export default function NumbersPage() {
  const LIMIT = 50;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<any | null>(null);

  /* =========================================================
     LOAD
  ========================================================= */

  async function load(q?: string) {
    const finalQuery = (q ?? query)?.trim();

    setLoading(true);

    try {
      const res = await api.get(
        `/numbers/feed?limit=${LIMIT}${
          finalQuery ? `&query=${encodeURIComponent(finalQuery)}` : ""
        }`
      );

      // ✅ SAFE PARSING
      const data = Array.isArray(res?.items) ? res.items : [];

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
     GROUP BY TYPE (aligné backend)
  ========================================================= */

  const grouped: Record<string, any[]> = {};

  items.forEach((item) => {
    const key = item.TYPE || "Autres";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-12">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Numbers
        </h1>

        <p className="text-sm text-gray-500 max-w-md">
          Accédez aux indicateurs clés du marché pour analyser,
          comparer et explorer les dynamiques en cours.
        </p>

        <div className="text-xs text-gray-400 pt-1">
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

      {/* CONTENT */}
      {loading ? (
        <p className="text-sm text-gray-400">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun chiffre disponible.
        </p>
      ) : (
        Object.entries(grouped).map(([type, groupItems]) => (
          <section key={type} className="space-y-4">

            {/* TYPE HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-semibold uppercase text-gray-400">
                {type}
              </h2>
              <span className="text-xs text-gray-300">
                {groupItems.length}
              </span>
            </div>

            {/* LIST */}
            <div className="divide-y">
              {groupItems.map((item: any) => (
                <NumberCard
                  key={item.ID_NUMBER}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>

          </section>
        ))
      )}

      {/* DRAWER */}
      {selectedItem && (
        <NumberDrawer
          id={selectedItem.ID_NUMBER}
          entityType={selectedItem.ENTITY_TYPE}
          onClose={() => setSelectedItem(null)}
        />
      )}

    </div>
  );
}
