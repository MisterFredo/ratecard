"use client";

export default function RadarDrawer({
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

      <div className="w-[500px] bg-white h-full p-6 overflow-auto">

        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Radar Preview</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="space-y-3 text-sm">

          {data?.key_points?.map((p: string, i: number) => (
            <div key={i} className="border p-2 rounded">
              {p}
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
