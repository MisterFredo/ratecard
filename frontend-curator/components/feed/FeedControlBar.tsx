"use client";

import type { Dispatch, SetStateAction } from "react";

/* =========================================================
   TYPES (temporaire — on factorisera plus tard)
========================================================= */
type FeedFilters = {
  query: string;
  mode: "explore" | "watch";
};

type Props = {
  filters: FeedFilters;
  onChange: (filters: FeedFilters) => void;
};

export default function FeedControlBar({
  filters,
  onChange,
}: Props) {
  /* =====================================================
     HANDLERS
  ===================================================== */

  function handleQueryChange(value: string) {
    onChange({
      ...filters,
      query: value,
    });
  }

  function handleModeChange(mode: "explore" | "watch") {
    onChange({
      ...filters,
      mode,
    });
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">

      {/* ================================
          TOP ROW
      ================================= */}
      <div className="flex items-center gap-3">

        {/* SEARCH INPUT */}
        <input
          type="text"
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Rechercher un sujet, une entreprise..."
          className="
            flex-1
            border rounded-md px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-teal-500
          "
        />

        {/* MODE TOGGLE */}
        <div className="flex border rounded-md overflow-hidden text-sm">

          <button
            onClick={() => handleModeChange("explore")}
            className={`
              px-3 py-1.5 transition
              ${
                filters.mode === "explore"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Explorer
          </button>

          <button
            onClick={() => handleModeChange("watch")}
            className={`
              px-3 py-1.5 transition
              ${
                filters.mode === "watch"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            Suivi
          </button>

        </div>
      </div>

      {/* ================================
          PLACEHOLDER FILTRES
      ================================= */}
      <div className="text-xs text-gray-500">
        Filtres avancés (topics, sociétés, solutions) à venir
      </div>

    </div>
  );
}
