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
      body: JSON.stringify({ url: item.url }),
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
            <th className="p-2 text-left">Fichier</th>
            <th className="p-2 text-left">Catégorie</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Taille</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">

              {/* VISUEL */}
              <td className="p-2">
                <img
                  src={item.url}
                  alt={item.id}
                  className="h-12 w-12 object-contain cursor-pointer bg-gray-50 border rounded"
                  onClick={() => setPreview(item)}
                />
              </td>

              {/* NOM */}
              <td className="p-2 break-all">{item.id}</td>

              {/* CAT */}
              <td className="p-2">{item.category}</td>

              {/* TYPE */}
              <td className="p-2">{item.type}</td>

              {/* TAILLE */}
              <td className="p-2">{(item.size / 1024).toFixed(1)} Ko</td>

              {/* ACTIONS */}
              <td className="p-2 flex gap-3">
                <button
                  onClick={() => setPreview(item)}
                  className="text-gray-600 hover:text-ratecard-blue"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => copy(item.url)}
                  className="text-gray-600 hover:text-ratecard-green"
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => deleteItem(item)}
                  className="text-red-500 hover:text-red-700"
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
              alt={preview.id}
              className="w-full max-h-[80vh] object-contain border rounded bg-white"
            />
            <p className="text-sm text-gray-600 break-all">{preview.url}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
