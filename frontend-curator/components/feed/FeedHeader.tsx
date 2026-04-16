"use client";

import { useState } from "react";

/* ========================================================= */

type Universe = {
  id: string;
  label: string;
  count?: number; // 🔥 optionnel
};

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;

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

  function triggerSearch() {
    const value = input.trim();
    setQuery(value);
    onSearch();
  }

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100 pb-4 pt-2 space-y-3">

      {/* =====================================================
         UNIVERS FILTER
      ===================================================== */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-1">

        {/* TOUS */}
        <button
          onClick={() => onSelectUniverse(null)}
          className={`
            flex items-center gap-1
            whitespace-nowrap
            px-3 py-1.5 rounded-full text-xs border transition-all
            ${
              selectedUniverse === null
                ? "bg-black text-white border-black shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          Tous
        </button>

        {/* UNIVERS */}
        {universes.map((u) => {
          const active = selectedUniverse === u.id;

          return (
            <button
              key={u.id}
              onClick={() => onSelectUniverse(u.id)}
              className={`
                flex items-center gap-1
                whitespace-nowrap
                px-3 py-1.5 rounded-full text-xs border transition-all
                ${
                  active
                    ? "bg-black text-white border-black shadow-sm scale-[1.02]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {u.label}

              {/* 🔥 COUNT */}
              {u.count !== undefined && (
                <span
                  className={`
                    ml-1 text-[10px] px-1.5 py-0.5 rounded-full
                    ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {u.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================
         SEARCH
      ===================================================== */}
      <div className="flex items-center gap-3 px-1">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          placeholder="Rechercher (Amazon, CTV, Retail media…)"
          className="
            flex-1
            border border-gray-200
            rounded-lg
            px-4 py-2
            text-sm
            bg-white
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
