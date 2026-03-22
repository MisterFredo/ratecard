"use client";

import { RadarItem } from "@/app/admin/radar/page";

export default function RadarRow({
  item,
  selected,
  onToggle,
  onPreview,
}: {
  item: RadarItem;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {

  return (
    <div
      className={`
        grid grid-cols-6 gap-3 items-center
        text-sm p-2 border-b
        ${selected ? "bg-gray-100" : ""}
      `}
    >

      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
      />

      <div>{item.entity_id}</div>

      <div>{item.period}</div>

      <div>{item.nb_contents}</div>

      <div>
        <span
          className={`
            text-xs px-2 py-1 rounded
            ${item.radar_status === "MISSING"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"}
          `}
        >
          {item.radar_status}
        </span>
      </div>

      <button
        onClick={onPreview}
        className="underline text-xs"
      >
        Preview
      </button>

    </div>
  );
}
