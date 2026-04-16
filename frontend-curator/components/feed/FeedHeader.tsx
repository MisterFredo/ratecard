"use client";

import { useState } from "react";

/* ========================================================= */

type Universe = {
  id: string;
  label: string;
};

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;

  // 🔥 NOUVEAU
  universes: Universe[];
  selectedUniverse: string | null;
  onSelectUniverse: (id: string | null) => void;
};

/* ========================================================= */

export default function FeedHeader({
  query,
  setQuery,
  onSearch,
  universes,
  selectedUniverse,
  onSelectUniverse,
}: Props) {
  const [input, setInput] = useState(query);

  /* =========================================================
     SEARCH
  ========================================================= */

  function triggerSearch() {
    const value = input.trim();
    setQuery(value);
    onSearch();
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-4">

      {/* =====================================================
         UNIVERS FILTER
      ===================================================== */}
      <div className="flex flex-wrap gap-2">

        {/* TOUS */}
        <button
          onClick={() => onSelectUniverse(null)}
          className={`
            px-3 py-1 rounded-md text-xs border
            ${
              selectedUniverse === null
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200"
            }
          `}
        >
          Tous
        </button>

        {/* UNIVERS USER */}
        {universes.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectUniverse(u.id)}
            className={`
              px-3 py-1 rounded-md text-xs border
              ${
                selectedUniverse === u.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200"
              }
            `}
          >
            {u.label}
          </button>
        ))}

      </div>

      {/* =====================================================
         SEARCH BAR
      ===================================================== */}
      <div className="flex items-center gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          placeholder="Ex : Amazon, CTV,…"
          className="
            flex-1
            border border-gray-200
            rounded-lg
            px-4 py-2
            text-sm
            focus:outline-none focus:ring-2 focus:ring-black
          "
        />

        <button
          onClick={triggerSearch}
          className="
            px-4 py-2
            rounded-lg
            bg-black text-white
            text-sm
            hover:opacity-90 transition
          "
        >
          Rechercher
        </button>

      </div>
    </div>
  );
}
