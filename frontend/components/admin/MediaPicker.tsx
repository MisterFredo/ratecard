"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { MediaItem } from "@/app/admin/media/page";

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "all", // "logos", "logosCropped", "articles", "ia", "generics", or "all"
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  category?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);

  // Load media from API
  async function load() {
    setLoading(true);
    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media); // tableau unifié de MediaItem
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  // Filtering logic
  const filtered =
    category === "all"
      ? media
      : media.filter((m) => m.category === category);

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="space-y-6">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-ratecard-blue mb-4">
          Choisir un visuel
        </h2>

        {/* LOADING */}
        {loading && <p className="text-gray-500">Chargement…</p>}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500">Aucun visuel dans cette catégorie.</p>
        )}

        {/* GRID MEDIA */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="border rounded p-2 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelect(item.url);
                  onClose();
                }}
              >
                <img
                  src={item.url}
                  className="w-full h-24 object-contain rounded"
                />
                <p className="text-[10px] mt-1 break-all text-gray-500">
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

