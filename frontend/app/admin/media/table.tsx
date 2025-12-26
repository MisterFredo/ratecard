"use client";

import { MediaItem } from "./page";
import { Trash2, Copy, Eye } from "lucide-react";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";

export default function MediaTable({
  items,
  refresh,
}: {
  items: MediaItem[];
  refresh: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function deleteItem(item: MediaItem) {
    if (!confirm("Supprimer ce visuel ?")) return;

    await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    });

    refresh();
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">

      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 border-b">
          <tr className="text-left text-gray-700 uppercase text-xs tracking-wide">
            <th className="p-3">Preview</th>
            <th className="p-3">Nom</th>
            <th className="p-3">Catégorie</th>
            <th className="p-3">Type</th>
            <th className="p-3">Taille</th>
            <th className="p-3">Créé le</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">

              {/* PREVIEW */}
              <td className="p-3">
                <img
                  src={item.url}
                  alt={item.id}
                  className="w-12 h-12 object-contain border rounded bg-gray-50 cursor-pointer"
                  onClick={() => setPreviewUrl(item.url)}
                />
              </td>

              {/* NAME */}
              <td className="p-3 break-all max-w-xs">{item.id}</td>

              {/* CATEGORY */}
              <td className="p-3 capitalize text-ratecard-blue">
                {item.category}
              </td>

              {/* TYPE */}
              <td className="p-3 text-gray-700">{item.type}</td>

              {/* SIZE */}
              <td className="p-3">{Math.round(item.size / 1024)} Ko</td>

              {/* CREATED */}
              <td className="p-3">
                {new Date(item.createdAt).toLocaleString("fr-FR")}
              </td>

              {/* ACTIONS */}
              <td className="p-3">
                <div className="flex justify-end gap-3">

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
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* PREVIEW DRAWER */}
      <Drawer open={!!previewUrl} onClose={() => setPreviewUrl(null)}>
        {previewUrl && (
          <div className="space-y-4">
            <img
              src={previewUrl}
              className="w-full border rounded bg-white"
            />
            <p className="text-sm text-gray-600 break-all">{previewUrl}</p>
          </div>
        )}
      </Drawer>

    </div>
  );
}
