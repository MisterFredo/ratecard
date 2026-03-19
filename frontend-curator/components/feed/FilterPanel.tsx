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

  const filtered = useMemo(() => {
    return items
      .filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.count - a.count);
  }, [items, search]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="border rounded-xl p-3 bg-white">
      <div className="font-semibold mb-2">{title}</div>

      {/* SEARCH */}
      <input
        className="w-full border px-2 py-1 mb-2 text-sm"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ACTIONS */}
      <div className="flex gap-2 mb-2 text-xs">
        <button onClick={() => onChange([])}>Clear</button>
        <button onClick={() => onChange(filtered.map((i) => i.id))}>
          Select all
        </button>
      </div>

      {/* LIST */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filtered.map((item) => (
          <label
            key={item.id}
            className="flex justify-between items-center cursor-pointer text-sm"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              {item.label}
            </div>
            <span className="text-gray-400">{item.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
