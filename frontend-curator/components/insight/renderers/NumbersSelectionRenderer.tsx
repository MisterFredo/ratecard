"use client";

export default function NumbersSelectionRenderer({
  items,
  selectedIds,
}: any) {

  const selected = items.filter((i: any) =>
    selectedIds.includes(i.ID_NUMBER)
  );

  return (
    <div className="space-y-3">

      {selected.map((n: any) => (
        <div
          key={n.ID_NUMBER}
          className="p-3 border rounded bg-gray-50"
        >
          <div className="text-sm font-semibold">
            {n.VALUE} {n.UNIT}
          </div>

          <div className="text-xs text-gray-700">
            {n.LABEL}
          </div>

          <div className="text-[10px] text-gray-400 mt-1">
            {n.TYPE} • {n.CATEGORY}
          </div>

          <div className="text-[10px] text-gray-400">
            {n.ENTITY_LABEL}
          </div>
        </div>
      ))}
    </div>
  );
}
