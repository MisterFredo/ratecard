"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { MediaItem } from "@/app/admin/media/page";

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "all",  // "logos", "logosCropped", "articles", "ia", "generics", "all"
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  category?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);

  // ---------------------------------------------------------
  // LOAD MEDIA
  // ---------------------------------------------------------
  async function load() {
    setLoading(true);

    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media); // tableau complet de MediaItem
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  // ---------------------------------------------------------
  // FILTERED MEDIA
  // ---------------------------------------------------------
  const filtered =
    category === "all"
      ? media
      : media.filter((m) => m.category === category);

  return (
    <Drawer open={open} onClose={onClose} title="Choisir un visuel" size="lg">
      <div className="space-y-6">

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500 text-sm">Chargement…</p>
        )}

        {/* EMPTY STATE */}
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
                  onSelect(item.url); // URL directe utilisée par Company / Articles / Axes
                  onClose();
                }}
              >
                {/* IMAGE */}
                <img
                  src={item.url}
                  alt={item.id}
                  className="w-full h-24 object-contain rounded bg-gray-50 border"
                />

                {/* INFO */}
                <p className="text-[10px] mt-1 break-all text-gray-700">
                  {item.id}
                </p>
                <p className="text-[10px] text-gray-400">
                  {item.category} · {item.type}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
