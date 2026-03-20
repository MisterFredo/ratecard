"use client";

import { useState, useMemo } from "react";

/* ========================================================= */

type Item = {
  id: string;
  label: string;
  count: number;
};

type Props = {
  title: string;
  items: Item[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

/* ========================================================= */

export default function FilterPanel({
  title,
  items,
  selected,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();

    return items
      .filter((i) =>
        (i.label || "")
          .toLowerCase()
          .includes(searchLower)
      )
      .sort((a, b) =>
        a.label.localeCompare(b.label, "fr", {
          sensitivity: "base",
        })
      );
  }, [items, search]);

  /* =========================================================
     TOGGLE
  ========================================================= */

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  /* =========================================================
     ACTIONS
  ========================================================= */

  function handleClear() {
    if (selected.length === 0) return;
    onChange([]);
  }

  function handleSelectAll() {
    const ids = filtered.map((i) => i.id);

    // évite un rerender inutile
    if (
      ids.length === selected.length &&
      ids.every((id) => selected.includes(id))
    ) {
      return;
    }

    onChange(ids);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="border rounded-xl p-3 bg-white">

      {/* TITLE */}
      <div className="font-semibold mb-2">{title}</div>

      {/* SEARCH */}
      <input
        className="
          w-full border px-2 py-1 mb-2 text-sm rounded
          focus:outline-none focus:ring-2 focus:ring-black/10
        "
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ACTIONS */}
      <div className="flex justify-between mb-2 text-xs text-gray-500">
        <button
          onClick={handleClear}
          className="hover:text-black transition"
        >
          Clear
        </button>

        <button
          onClick={handleSelectAll}
          className="hover:text-black transition"
        >
          Select all
        </button>
      </div>

      {/* LIST */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {filtered.map((item) => {
          const isActive = selected.includes(item.id);

          return (
            <label
              key={item.id}
              className={`
                flex justify-between items-center cursor-pointer text-sm px-2 py-1 rounded transition
                ${
                  isActive
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggle(item.id);
                  }}
                />
                {item.label}
              </div>

              <span className="text-xs opacity-60">
                {item.count}
              </span>
            </label>
          );
        })}
      </div>

    </div>
  );
}
