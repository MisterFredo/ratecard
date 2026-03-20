"use client";

import { useState, useEffect } from "react";

/* ========================================================= */

type Props = {
  query: string;
  setQuery: (v: string) => void;

  onSearch: () => void;
};

/* ========================================================= */

export default function FeedHeader({
  query,
  setQuery,
  onSearch,
}: Props) {

  const [input, setInput] = useState(query);

  // sync si reset externe
  useEffect(() => {
    setInput(query);
  }, [query]);

  /* ========================================================= */

  function handleSearch() {
    const value = input.trim();
    setQuery(value);
    onSearch(value);
  }

  /* ========================================================= */

  return (
    <div className="space-y-5">

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search (Amazon, clean room, retail media...)"
          className="
            flex-1 border border-gray-300 px-4 py-2.5 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-black/10
          "
        />

        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-black text-white text-sm rounded-lg"
        >
          Search
        </button>
      </div>

    </div>
  );
}
