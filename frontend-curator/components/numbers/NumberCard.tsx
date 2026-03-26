"use client";

type Props = {
  item: any;
  onClick: () => void;
};

/* ========================================================= */

function formatValue(item: any) {
  if (item.value === undefined || item.value === null) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[item.scale || ""] || "";
  const unit = item.unit || "";

  return `${item.value}${scale}${unit}`;
}

function formatMeta(item: any) {
  return [item.zone, item.period].filter(Boolean).join(" — ");
}

/* ========================================================= */

export default function NumberCard({ item, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="
        group
        flex items-start justify-between
        py-4
        cursor-pointer
        transition
        hover:bg-gray-50
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
          {item.label}
        </div>

        {/* META */}
        {formatMeta(item) && (
          <div className="text-xs text-gray-400">
            {formatMeta(item)}
          </div>
        )}

        {/* ENTITY */}
        <div className="text-xs text-gray-400">
          {item.entity_type === "company" && item.entity_id && (
            <span>{item.entity_id}</span>
          )}
          {item.entity_type === "topic" && item.entity_id && (
            <span>{item.entity_id}</span>
          )}
          {item.entity_type === "solution" && item.entity_id && (
            <span>{item.entity_id}</span>
          )}
        </div>

      </div>

      {/* RIGHT */}
      <div className="ml-4 text-xs text-gray-400 whitespace-nowrap">
        {item.type}
      </div>
    </div>
  );
}
