"use client";

import { useState, useEffect } from "react";

import NumbersExplorer from "@/components/numbers/NumbersExplorer";
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

      // ✅ FIX : on récupère items
      const data = res?.items ?? [];

      setItems(data);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ========================================================= */

  // 👉 group by TYPE
  const grouped: Record<string, any[]> = {};

  items.forEach((item) => {
    const key = item.type || "Autres";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  /* ========================================================= */

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
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <section key={type} className="space-y-4">

            {/* TYPE HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-semibold uppercase text-gray-400">
                {type}
              </h2>
              <span className="text-xs text-gray-300">
                {items.length}
              </span>
            </div>

            {/* LIST */}
            <div className="divide-y">
              {items.map((item: any) => (
                <div className="divide-y">
                  {items.map((item: any) => (
                    <NumberCard
                      key={item.id_number}
                      item={item}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              ))}
            </div>

          </section>
        ))
      )}

      {/* DRAWER */}
      {selectedItem && (
        <NumberDrawer
          id={selectedItem.id_number}
          entityType={selectedItem.entity_type}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
