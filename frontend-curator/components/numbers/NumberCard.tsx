"use client";

type Props = {
  item: any;
  onClick: () => void;
  selected?: boolean;
};

/* ========================================================= */

function formatValue(item: any) {
  if (!item.VALUE) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[item.SCALE || ""] || "";
  const unit = item.UNIT || "";

  return `${item.VALUE}${scale}${unit}`;
}

/* ========================================================= */

export default function NumberCard({ item, onClick, selected }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded border cursor-pointer transition
        ${
          selected
            ? "border-teal-500 bg-teal-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* BADGES */}
      <div className="flex flex-wrap gap-1 mb-2">

        {item.TYPE && (
          <span className="
            text-[9px] px-2 py-[2px] rounded-full
            bg-gray-100 text-gray-600 uppercase
          ">
            {item.TYPE}
          </span>
        )}

        {item.CATEGORY && (
          <span className="
            text-[9px] px-2 py-[2px] rounded-full
            bg-gray-50 text-gray-400 uppercase
          ">
            {item.CATEGORY}
          </span>
        )}

      </div>

      {/* VALUE */}
      <div className="text-sm font-semibold text-gray-900">
        {formatValue(item)}
      </div>

      {/* LABEL */}
      <div className="text-xs text-gray-700 mt-1 line-clamp-2">
        {item.LABEL}
      </div>

      {/* META */}
      {(item.ZONE || item.PERIOD) && (
        <div className="text-[10px] text-gray-400 mt-1">
          {[item.ZONE, item.PERIOD].filter(Boolean).join(" — ")}
        </div>
      )}

      {/* ENTITY */}
      {item.ENTITY_LABEL && (
        <div className="
          text-[10px] text-gray-500 mt-2 uppercase
        ">
          {item.ENTITY_LABEL}
        </div>
      )}
    </div>
  );
}
