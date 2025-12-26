"use client";

import { useState } from "react";
import { MediaItem } from "./page";
import { Trash2, Eye, Copy } from "lucide-react";
import Drawer from "@/components/ui/Drawer";

export default function MediaGrid({
  items,
  refresh,
}: {
  items: MediaItem[];
  refresh: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Copy URL helper
  function copy(url: string) {
    navigator.clipboard.writeText(url);
  }

  // Delete helper
  async function deleteItem(item: MediaItem) {
    if (!confirm("Supprimer ce visuel ?")) return;

    await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    });

    refresh();
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg bg-white shadow-sm p-2 flex flex-col items-center hover:shadow-md transition cursor-pointer"
        >
          {/* IMAGE */}
          <img
            src={item.url}
            alt={item.id}
            className="w-full h-28 object-contain border bg-gray-50 rounded"
            onClick={() => setPreviewUrl(item.url)}
          />

          {/* FILENAME */}
          <p className="text-[10px] text-gray-600 mt-2 text-center break-all px-1">
            {item.id}
          </p>

          {/* CATEGORY */}
          <p className="text-[10px] mt-1 text-ratecard-blue uppercase tracking-wide">
            {item.category}
          </p>

          {/* TYPE */}
          <p className="text-[10px] text-gray-500">
            {item.type}
          </p>

          {/* ACTIONS */}
          <div className="flex justify-center gap-3 mt-2">

            {/* Preview */}
            <button
              onClick={() => setPreviewUrl(item.url)}
              className="text-gray-600 hover:text-ratecard-blue"
              title="Aperçu"
            >
              <Eye size={16} />
            </button>

            {/* Copy URL */}
            <button
              onClick={() => copy(item.url)}
              className="text-gray-600 hover:text-ratecard-green"
              title="Copier URL"
            >
              <Copy size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteItem(item)}
              className="text-red-500 hover:text-red-700"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* DRAWER PREVIEW */}
      <Drawer
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
      >
        {previewUrl && (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="preview"
              className="w-full border rounded bg-white"
            />
            <p className="text-sm text-gray-600 break-all">{previewUrl}</p>
          </div>
        )}
      </Drawer>

    </div>
  );
}
