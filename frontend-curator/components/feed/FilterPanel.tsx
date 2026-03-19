"use client";

import { useState, useMemo } from "react";

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

export default function FilterPanel({
  title,
  items,
  selected,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  /* =========================================================
     FILTER + SORT (ALPHABETIQUE)
  ========================================================= */

  const filtered = useMemo(() => {
    return items
      .filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.label.localeCompare(b.label)); // ✅ FIX
  }, [items, search]);

  /* =========================================================
     TOGGLE
  ========================================================= */

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="font-semibold mb-2">{title}</div>

      {/* SEARCH */}
      <input
        className="w-full border px-2 py-1 mb-2 text-sm rounded"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ACTIONS */}
      <div className="flex justify-between mb-2 text-xs text-gray-500">
        <button onClick={() => onChange([])}>
          Clear
        </button>

        <button
          onClick={() => onChange(filtered.map((i) => i.id))}
        >
          Select all
        </button>
      </div>

      {/* LIST */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filtered.map((item) => {
          const isActive = selected.includes(item.id);

          return (
            <label
              key={item.id}
              className={`
                flex justify-between items-center cursor-pointer text-sm px-2 py-1 rounded
                ${isActive ? "bg-black text-white" : "hover:bg-gray-100"}
              `}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggle(item.id)}
                />
                {item.label}
              </div>

              {item.count > 0 && (
                <span className="text-xs opacity-60">
                  {item.count}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
