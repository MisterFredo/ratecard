"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

import NumberCard from "@/components/numbers/NumberCard";
import NumbersSelectionPanel from "@/components/numbers/NumbersSelectionPanel";
import NumbersHeader from "@/components/numbers/NumbersHeader";

/* =========================================================
   UTILS
========================================================= */

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : null;
}

async function fetchUserUniverses(userId: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/context/${userId}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const json = await res.json();
    return json?.universes || [];

  } catch {
    return [];
  }
}

/* =========================================================
   FILTER
========================================================= */

function filterNumbers(items: any[], userUniverses: string[]) {

  // ADMIN / FULL ACCESS
  if (!userUniverses || userUniverses.length === 0) {
    return items;
  }

  return items.filter((item) => {

    const universes = item.UNIVERSES || [];

    // GLOBAL
    if (universes.length === 0) {
      return true;
    }

    return universes.some((u: string) =>
      userUniverses.includes(u)
    );
  });
}

/* ========================================================= */

export default function NumbersPage() {
  const LIMIT = 100;

  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
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

      const userId = getCookie("curator_user_id");

      if (!userId) {
        setItems(data);
        setFilteredItems(data);
        return;
      }

      const userUniverses = await fetchUserUniverses(userId);

      const filtered = filterNumbers(data, userUniverses);

      setItems(data);
      setFilteredItems(filtered);

    } catch (e) {
      console.error("❌ Numbers load error", e);
      setItems([]);
      setFilteredItems([]);
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

  /* =========================================================
     GROUP BY TYPE
  ========================================================= */

  const grouped: Record<string, any[]> = {};

  filteredItems.forEach((item) => {
    const key = item.TYPE || "Autres";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  /* ========================================================= */

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="xl:col-span-2 space-y-10">

        {/* HEADER */}
        <NumbersHeader
          query={query}
          setQuery={setQuery}
          onSearch={(q) => load(q)}
        />

        {/* COUNT */}
        <div className="text-xs text-gray-400">
          {filteredItems.length} chiffres
        </div>

        {/* CONTENT */}
        {loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : (
          Object.entries(grouped).map(([type, items]) => (

            <section key={type} className="space-y-4">

              {/* TYPE HEADER */}
              <div className="flex items-center justify-between">

                <h2 className="
                  text-xs font-semibold uppercase tracking-wide text-gray-400
                ">
                  {type}
                </h2>

                <span className="text-xs text-gray-300">
                  {items.length}
                </span>

              </div>

              {/* GRID */}
              <div className="
                grid
                grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
                gap-3
              ">
                {items.map((item: any) => {
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

            </section>

          ))
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
            items={filteredItems}
            selectedIds={selectedIds}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
