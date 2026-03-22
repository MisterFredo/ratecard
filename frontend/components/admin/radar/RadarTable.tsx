"use client";

import RadarRow from "./RadarRow";
import { RadarItem } from "@/app/admin/radar/page";

export default function RadarTable({
  items,
  selected,
  onToggle,
  onPreview,
  loading,
}: {
  items: RadarItem[];
  selected: RadarItem[];
  onToggle: (item: RadarItem) => void;
  onPreview: (item: RadarItem) => void;
  loading: boolean;
}) {

  function isSelected(item: RadarItem) {
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
        <div>Volume</div>
        <div>Status</div>
        <div></div>
      </div>

      {/* ROWS */}
      {items.map((item, i) => (
        <RadarRow
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
