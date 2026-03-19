"use client";

import { useState } from "react";

/* ========================================================= */

type Props = {
  query: string;
  setQuery: (v: string) => void;

  types: string[];
  setTypes: (v: string[]) => void;

  newsTypes: string[];
  setNewsTypes: (v: string[]) => void;

  onSearch: () => void;
  onReset: () => void;
};

/* ========================================================= */

export default function FeedHeader({
  query,
  setQuery,
  types,
  setTypes,
  newsTypes,
  setNewsTypes,
  onSearch,
  onReset,
}: Props) {
  const [input, setInput] = useState(query);

  /* =========================================================
     HANDLERS
  ========================================================= */

  function toggleType(type: string) {
    if (types.includes(type)) {
      setTypes(types.filter((t) => t !== type));
    } else {
      setTypes([...types, type]);
    }
  }

  function toggleNewsType(type: string) {
    if (newsTypes.includes(type)) {
      setNewsTypes(newsTypes.filter((t) => t !== type));
    } else {
      setNewsTypes([...newsTypes, type]);
    }
  }

  function handleSearch() {
    setQuery(input);
    onSearch();
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-5">

      {/* ============================
         SEARCH BAR
      ============================ */}
      <div className="flex gap-3">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search (ex: retail media, Amazon clean room...)"
          className="
            flex-1
            border border-gray-300
            px-4 py-2.5
            rounded-lg
            text-sm
            focus:outline-none focus:ring-2 focus:ring-black/10
          "
        />

        <button
          onClick={handleSearch}
          className="
            px-5 py-2.5
            bg-black text-white
            text-sm rounded-lg
            hover:opacity-90
          "
        >
          Search
        </button>

        <button
          onClick={onReset}
          className="
            px-4 py-2.5
            text-sm
            border border-gray-300 rounded-lg
            hover:bg-gray-50
          "
        >
          Reset
        </button>
      </div>

      {/* ============================
         FILTERS ROW
      ============================ */}
      <div className="flex flex-wrap gap-3">

        {/* TYPE */}
        <FilterGroup label="Type">
          {["news", "analysis"].map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={types.includes(t)}
              onClick={() => toggleType(t)}
            />
          ))}
        </FilterGroup>

        {/* NEWS TYPE */}
        <FilterGroup label="News type">
          {["corporate", "product", "client"].map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={newsTypes.includes(t)}
              onClick={() => toggleNewsType(t)}
            />
          ))}
        </FilterGroup>
      </div>
    </div>
  );
}

/* ========================================================= */

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{label}:</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

/* ========================================================= */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs
        border transition
        ${
          active
            ? "bg-black text-white border-black"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
        }
      `}
    >
      {label}
    </button>
  );
}
