"use client";

import { NumbersItem } from "@/types/numbers";

export default function NumbersRow({
  item,
  selected,
  onToggle,
  onPreview,
}: {
  item: NumbersItem;
  selected: boolean;
  onToggle: () => void;
  onPreview: () => void;
}) {

  /* =========================================================
     DATA QUALITY (🔥 clé produit)
  ========================================================= */

  function getQuality(nb: number) {
    if (nb === 0) return { label: "EMPTY", style: "bg-red-100 text-red-600" };
    if (nb < 5) return { label: "WEAK", style: "bg-orange-100 text-orange-600" };
    if (nb < 15) return { label: "OK", style: "bg-blue-100 text-blue-600" };
    return { label: "RICH", style: "bg-green-100 text-green-600" };
  }

  const quality = getQuality(item.nb_numbers || 0);

  /* ========================================================= */

  return (
    <div
      className={`
        grid grid-cols-6 gap-3 items-center
        text-sm p-2 border-b
        ${selected ? "bg-gray-100" : ""}
      `}
    >

      {/* SELECT */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
      />

      {/* ENTITY */}
      <div className="flex flex-col">
        <span>{item.entity_name || item.entity_id}</span>
        <span className="text-xs text-gray-400">
          {item.entity_type}
        </span>
      </div>

      {/* PERIOD */}
      <div>{item.period}</div>

      {/* NB NUMBERS */}
      <div>{item.nb_numbers}</div>

      {/* STATUS + QUALITY */}
      <div className="flex items-center gap-2">

        {/* STATUS */}
        <span
          className={`
            text-xs px-2 py-1 rounded
            ${item.numbers_status === "MISSING"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"}
          `}
        >
          {item.numbers_status}
        </span>

        {/* QUALITY */}
        <span
          className={`
            text-xs px-2 py-1 rounded
            ${quality.style}
          `}
        >
          {quality.label}
        </span>

      </div>

      {/* PREVIEW */}
      <button
        onClick={onPreview}
        className="underline text-xs"
      >
        Preview
      </button>

    </div>
  );
}
