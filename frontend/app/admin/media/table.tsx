"use client";

import { MediaItem } from "./page";
import { Trash2, Eye, Copy } from "lucide-react";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";

export default function MediaTable({
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
        media_id: item.media_id, // 🆕 indispensable
      }),
    });

    const json = await res.json();
    if (json.status === "ok") refresh();
    else alert("Erreur : " + json.message);
  }

  return (
    <div className="overflow-x-auto border rounded bg-white">

      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Aperçu</th>
            <th className="p-2 text-left">Titre</th>
            <th className="p-2 text-left">Fichier</th>
            <th className="p-2 text-left">Catégorie</th>
            <th className="p-2 text-left">Format</th>
            <th className="p-2 text-left">Taille</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.media_id} className="border-t hover:bg-gray-50">

              {/* VISUEL */}
              <td className="p-2">
                <img
                  src={item.url}
                  alt={item.filename}
                  className="h-12 w-12 object-contain cursor-pointer bg-gray-50 border rounded"
                  onClick={() => setPreview(item)}
                />
              </td>

              {/* TITLE */}
              <td className="p-2 text-gray-800 font-medium">
                {item.title}
              </td>

              {/* FILENAME */}
              <td className="p-2 break-all text-gray-600 text-xs">
                {item.filename}
              </td>

              {/* CAT */}
              <td className="p-2 uppercase text-ratecard-blue text-xs tracking-wide">
                {item.folder}
              </td>

              {/* FORMAT */}
              <td className="p-2 text-gray-500 text-xs">
                {item.format}
              </td>

              {/* TAILLE */}
              <td className="p-2 text-gray-600">
                {item.size ? `${(item.size / 1024).toFixed(1)} Ko` : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 flex gap-3">
                <button
                  onClick={() => setPreview(item)}
                  className="text-gray-600 hover:text-ratecard-blue"
                  title="Aperçu"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => copy(item.url)}
                  className="text-gray-600 hover:text-ratecard-green"
                  title="Copier URL"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => deleteItem(item)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

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

