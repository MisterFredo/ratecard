"use client";

import { useState } from "react";

/* ========================================================= */

type Props = {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
};

/* ========================================================= */

export default function NumbersHeader({
  query,
  setQuery,
  onSearch,
}: Props) {
  const [input, setInput] = useState(query);

  function triggerSearch() {
    const value = input.trim();
    setQuery(value);
    onSearch();
  }

  return (
    <div className="space-y-3">

      {/* TITLE */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Numbers
        </h1>

        <p className="text-sm text-gray-500">
          Accédez aux indicateurs clés du marché.
          Sélectionnez et structurez vos données.
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          placeholder="Ex : Amazon, CPM, France..."
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
