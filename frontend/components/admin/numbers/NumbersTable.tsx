"use client";

import NumbersRow from "./NumbersRow";
import { NumbersItem } from "@/types/numbers";

export default function NumbersTable({
  items,
  selected,
  onToggle,
  onPreview,
  loading,
}: {
  items: NumbersItem[];
  selected: NumbersItem[];
  onToggle: (item: NumbersItem) => void;
  onPreview: (item: NumbersItem) => void;
  loading: boolean;
}) {

  function isSelected(item: NumbersItem) {
    return selected.some(
      (s) =>
        s.entity_id === item.entity_id &&
        s.period === item.period &&
        s.frequency === item.frequency &&
        s.year === item.year
    );
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="border rounded bg-white">

      {/* HEADER */}
      <div className="grid grid-cols-6 gap-3 p-2 text-xs font-semibold border-b bg-gray-50">
        <div></div>
        <div>Entity</div>
        <div>Period</div>
        <div># Numbers</div> {/* 🔥 différent */}
        <div>Status</div>
        <div></div>
      </div>

      {/* ROWS */}
      {items.map((item, i) => (
        <NumbersRow
          key={i}
          item={item}
          selected={isSelected(item)}
          onToggle={() => onToggle(item)}
          onPreview={() => onPreview(item)}
        />
      ))}

    </div>
  );
}
