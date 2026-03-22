"use client";

export default function NumbersDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">

      <div className="w-[520px] bg-white h-full p-6 overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="font-semibold">
            Numbers Preview
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* EMPTY */}
        {!data?.metrics?.length && (
          <p className="text-sm text-gray-400">
            Aucun chiffre consolidé.
          </p>
        )}

        {/* METRICS */}
        <div className="space-y-4">

          {data?.metrics?.map((m: any, i: number) => (
            <div
              key={i}
              className="border rounded-lg p-4 space-y-2"
            >

              {/* LABEL */}
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {m.label}
              </div>

              {/* VALUE */}
              <div className="text-lg font-semibold text-gray-900">
                {m.value}
              </div>

              {/* RANGE */}
              {m.range && (
                <div className="text-xs text-gray-500">
                  Range: {m.range}
                </div>
              )}

              {/* META */}
              <div className="flex items-center gap-3 text-xs">

                {/* CONFIDENCE */}
                {m.confidence && (
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {m.confidence}
                  </span>
                )}

                {/* SOURCES */}
                {typeof m.sources === "number" && (
                  <span className="text-gray-400">
                    {m.sources} sources
                  </span>
                )}

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
