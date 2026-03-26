"use client";

type Props = {
  item: any;
  onClick: () => void;
  selected?: boolean;
};

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
      {/* VALUE */}
      <div className="text-sm font-semibold text-gray-900">
        {formatValue(item)}
      </div>

      {/* LABEL */}
      <div className="text-xs text-gray-700 mt-1 line-clamp-2">
        {item.LABEL}
      </div>

      {/* ENTITY */}
      <div className="text-[10px] text-gray-400 mt-2 uppercase">
        {item.ENTITY_LABEL}
      </div>
    </div>
  );
}
