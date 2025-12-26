"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";

export type PickerMediaItem = {
  id: string;
  url: string;
  folder: string;     // très important → logos, logos-cropped, articles…
  type?: string;
  category?: string;  // peut exister mais ce n'est plus utilisé
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "logos-cropped", // valeur par défaut pour SOCIÉTÉS
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  category?: string; // = "logos", "logos-cropped", "articles", "generics", "ia"
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<PickerMediaItem[]>([]);

  // ---------------------------------------------------------
  // LOAD MEDIA (nouvelle API renvoie json.media[])
  // ---------------------------------------------------------
  async function load() {
    setLoading(true);

    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media); // on stocke tous les éléments
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  // ---------------------------------------------------------
  // FILTRAGE PAR DOSSIER (le vrai critère)
  // ---------------------------------------------------------
  const filtered =
    category === "all"
      ? media
      : media.filter((m) => m.folder === category);

  return (
    <Drawer open={open} onClose={onClose} title="Choisir un visuel" size="lg">
      <div className="space-y-6">

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500 text-sm">Chargement…</p>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 italic text-sm">
            Aucun visuel disponible dans cette catégorie.
          </p>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="border rounded p-2 bg-white hover:bg-gray-50 cursor-pointer transition"
                onClick={() => {
                  onSelect(item.url); // renvoie l'URL directe
                  onClose();
                }}
              >
                <img
                  src={item.url}
                  alt={item.id}
                  className="w-full h-24 object-contain rounded bg-gray-50 border"
                />

                <p className="text-[10px] mt-1 break-all text-gray-700">
                  {item.id}
                </p>

                <p className="text-[10px] text-gray-400">
                  {item.folder} · {item.type}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
