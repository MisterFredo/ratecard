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
  const [preview, setPreview] = useState<MediaItem | null>(null);

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
  }

  async function deleteItem(item: MediaItem) {
    if (!confirm("Supprimer ce média ?")) return;

    const res = await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: item.url,
        media_id: item.media_id,   // 🆕 indispensable
      }),
    });

    const json = await res.json();

    if (json.status === "ok") {
      refresh();
    } else {
      alert("Erreur : " + json.message);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">

      {items.map((item) => (
        <div
          key={item.media_id}
          className="border rounded-lg bg-white shadow-sm p-2 flex flex-col items-center hover:shadow-md transition cursor-pointer"
        >
          {/* IMAGE */}
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-28 object-contain border bg-gray-50 rounded"
            onClick={() => setPreview(item)}
          />

          {/* TITLE */}
          <p className="text-xs font-semibold text-gray-800 mt-2 text-center px-1 truncate w-full">
            {item.title}
          </p>

          {/* FILENAME */}
          <p className="text-[10px] text-gray-500 text-center break-all px-1">
            {item.filename}
          </p>

          {/* FOLDER + FORMAT */}
          <p className="text-[10px] text-gray-400 mt-1">
            {item.folder} · {item.format}
          </p>

          {/* TAILLE */}
          <p className="text-[10px] text-gray-500">
            {item.size ? `${Math.round(item.size / 1024)} Ko` : "—"}
          </p>

          {/* ACTIONS */}
          <div className="flex justify-center gap-3 mt-2">

            {/* Preview */}
            <button
              onClick={() => setPreview(item)}
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

      {/* PREVIEW DRAWER */}
      <Drawer
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Aperçu du média"
        size="xl"
      >
        {preview && (
          <div className="space-y-4">
            <img
              src={preview.url}
              alt={preview.filename}
              className="w-full max-h-[80vh] object-contain border rounded bg-white"
            />

            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                {preview.title}
              </p>
              <p className="text-xs text-gray-500 break-all">
                {preview.filename}
              </p>
              <p className="text-xs text-gray-500">
                {preview.folder} · {preview.format}
              </p>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}

