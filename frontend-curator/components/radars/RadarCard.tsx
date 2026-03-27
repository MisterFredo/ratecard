"use client";

import { Eye } from "lucide-react";

/* ========================================================= */

type Props = {
  item: any;

  selected: boolean;
  onClick: () => void;

  onOpenDrawer: () => void;
};

/* ========================================================= */

function formatRadarLabel(r: any) {
  if (r.FREQUENCY === "MONTHLY") {
    const date = new Date(r.YEAR, r.PERIOD - 1);
    return new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (r.FREQUENCY === "QUARTERLY") {
    return `T${r.PERIOD} ${r.YEAR}`;
  }

  if (r.FREQUENCY === "WEEKLY") {
    return `S${r.PERIOD} ${r.YEAR}`;
  }

  return "";
}

/* ========================================================= */

export default function RadarCard({
  item,
  selected,
  onClick,
  onOpenDrawer,
}: Props) {

  const preview = item.KEY_POINTS?.slice(0, 2) || [];

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl border transition
        bg-white p-4 space-y-3
        hover:shadow-md

        ${selected
          ? "border-black shadow-sm"
          : "border-gray-200"
        }
      `}
    >

      {/* DRAWER ICON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDrawer();
        }}
        className="
          absolute top-2 right-2
          text-gray-400 hover:text-black
        "
      >
        <Eye size={16} />
      </button>

      {/* DATE */}
      <div className="text-xs text-gray-400">
        {formatRadarLabel(item)}
      </div>

      {/* CONTENT */}
      <div className="space-y-2">

        {preview.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            Aucun signal disponible
          </p>
        )}

        {preview.map((point: string, i: number) => (
          <p
            key={i}
            className="text-sm text-gray-800 leading-snug line-clamp-2"
          >
            • {point}
          </p>
        ))}

      </div>

    </div>
  );
}
