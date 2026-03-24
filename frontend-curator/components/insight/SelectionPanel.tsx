"use client";

import type { FeedItem } from "@/types/feed";

type Props = {
  items: FeedItem[];
  selectedIds: string[];

  email: string;
  loading: boolean;

  onToggle: (item: FeedItem) => void;
  onGenerateInsight: () => void;
};

export default function SelectionPanel({
  items,
  selectedIds,
  email,
  loading,
  onToggle,
  onGenerateInsight,
}: Props) {
  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id)
  );

  return (
    <div className="sticky top-4 space-y-4">

      {/* HEADER */}
      <div className="text-sm font-semibold">
        Sélection ({selectedItems.length})
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[300px] overflow-auto">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="text-xs border p-2 rounded"
          >
            {item.title}
          </div>
        ))}
      </div>

      {/* EMAIL PREVIEW */}
      <div className="border rounded-lg p-3 bg-gray-50">
        <div className="flex justify-between mb-2">
          <span className="text-xs font-medium">Email</span>

          <button
            onClick={() =>
              navigator.clipboard.writeText(email)
            }
            className="text-xs text-blue-600"
          >
            Copier
          </button>
        </div>

        <textarea
          value={email}
          readOnly
          className="w-full min-h-[200px] text-xs p-2 border rounded"
        />
      </div>

      {/* ACTION */}
      <button
        onClick={onGenerateInsight}
        disabled={loading || selectedItems.length === 0}
        className="w-full py-2 text-sm bg-black text-white rounded disabled:opacity-50"
      >
        {loading ? "Insight..." : "Générer insight"}
      </button>
    </div>
  );
}
