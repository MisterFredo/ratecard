"use client";

type Props = {
  item: any;
  onClick: () => void;
};

/* ========================================================= */

function formatValue(item: any) {
  if (item.VALUE === undefined || item.VALUE === null) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[item.SCALE || ""] || "";
  const unit = item.UNIT || "";

  return `${item.VALUE}${scale}${unit}`;
}

function formatMeta(item: any) {
  return [item.ZONE, item.PERIOD].filter(Boolean).join(" — ");
}

/* ========================================================= */

export default function NumberCard({ item, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="
        group
        flex items-start justify-between
        py-4 px-2
        cursor-pointer
        transition
        hover:bg-gray-50 rounded
      "
    >
      {/* LEFT */}
      <div className="flex-1 min-w-0 space-y-1">

        {/* VALUE */}
        <div className="text-base font-semibold text-gray-900">
          {formatValue(item)}
        </div>

        {/* LABEL */}
        <div className="
          text-sm text-gray-800 leading-snug
          group-hover:text-black
        ">
          {item.LABEL}
        </div>

        {/* META */}
        {formatMeta(item) && (
          <div className="text-xs text-gray-400">
            {formatMeta(item)}
          </div>
        )}

        {/* ENTITY (FIX MAJEUR UX) */}
        {item.ENTITY_LABEL && (
          <div className="
            text-xs text-gray-500 mt-1
            group-hover:text-gray-700
          ">
            {item.ENTITY_LABEL}
          </div>
        )}

      </div>

      {/* RIGHT */}
      <div className="
        ml-4 text-[10px] uppercase tracking-wide
        text-gray-400 whitespace-nowrap
      ">
        {item.TYPE}
      </div>
    </div>
  );
}
