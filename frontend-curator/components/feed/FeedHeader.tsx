"use client";

import { useState } from "react";

/* ========================================================= */

type Option = {
  id: string;
  label: string;
  count: number;
};

type Props = {
  query: string;
  setQuery: (v: string) => void;

  // 🔵 APPLIQUE UNIQUEMENT AUX NEWS
  newsTypes: string[];
  setNewsTypes: (v: string[]) => void;

  newsTypeOptions: Option[];

  onSearch: () => void;
  onReset: () => void;
};

/* ========================================================= */

export default function FeedHeader({
  query,
  setQuery,
  newsTypes,
  setNewsTypes,
  newsTypeOptions,
  onSearch,
  onReset,
}: Props) {

  const [input, setInput] = useState(query);

  /* =========================================================
     HELPERS
  ========================================================= */

  function toggle(value: string) {
    let next: string[];

    if (newsTypes.includes(value)) {
      next = newsTypes.filter((v) => v !== value);
    } else {
      next = [...newsTypes, value];
    }

    setNewsTypes(next);

    // 🔥 reload après update
    setTimeout(onSearch, 0);
  }

  function handleSearch() {
    setQuery(input);

    // 🔥 garantit que query est bien synchro avant reload
    setTimeout(onSearch, 0);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-5">

      {/* ============================
         SEARCH
      ============================ */}
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

        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* ============================
         NEWS FILTERS (ONLY NEWS)
      ============================ */}
      <FilterGroup label="News filters">
        {newsTypeOptions.map((t) => (
          <FilterChip
            key={t.id}
            label={`${t.label} (${t.count})`}
            active={newsTypes.includes(t.id)}
            onClick={() => toggle(t.id)}
          />
        ))}
      </FilterGroup>

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
      <div className="flex gap-2 flex-wrap">{children}</div>
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
        px-3 py-1.5 rounded-full text-xs border transition
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
