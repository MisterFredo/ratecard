"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";

export type PickerMediaItem = {
  media_id: string;
  url: string;           // 🔥 URL GCS directe
  title: string;
  filename: string;
  folder: string;        // logos | logos-cropped | generics | articles | ia
  format: string;        // square | rectangle | original
  createdAt?: string;

  entity_type?: string | null; // "company" | "person" | "axe" | "article"
  entity_id?: string | null;
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "logos-cropped",
  folders,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: {
    media_id: string;
    url: string;
    format: string;
    folder: string;
  }) => void;

  category?: string;     // ancien comportement
  folders?: string[];    // multi dossiers
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<PickerMediaItem[]>([]);

  /* ---------------------------------------------------------
     LOAD MEDIA (GCS URLs déjà fournies par l’API Next.js)
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media);  // 🔥 plus besoin de retraitement
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  /* ---------------------------------------------------------
     FILTRAGE
  --------------------------------------------------------- */
  let filtered = media;

  if (folders && folders.length > 0) {
    filtered = media.filter((m) => folders.includes(m.folder));
  } else if (category !== "all") {
    filtered = media.filter((m) => m.folder === category);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <Drawer open={open} onClose={onClose} title="Choisir un visuel" size="lg">
      <div className="space-y-6">

        {/* LOADING */}
        {loading && <p className="text-gray-500 text-sm">Chargement…</p>}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 italic text-sm">
            Aucun média disponible.
          </p>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((item) => {
              const assigned = item.entity_type && item.entity_id;

              return (
                <div
                  key={item.media_id}
                  className={`border rounded p-3 bg-white hover:bg-gray-50 cursor-pointer transition relative ${
                    assigned ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => {
                    onSelect({
                      media_id: item.media_id,
                      url: item.url,        // 🔥 URL publique GCS
                      format: item.format,
                      folder: item.folder,
                    });
                    onClose();
                  }}
                >
                  {/* BADGE “assigné” */}
                  {assigned && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Assigné
                    </span>
                  )}

                  {/* IMAGE */}
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-24 object-contain rounded bg-gray-50 border"
                  />

                  {/* TITLE */}
                  <p className="text-xs mt-2 font-medium text-gray-800 truncate">
                    {item.title}
                  </p>

                  {/* FILENAME */}
                  <p className="text-[10px] text-gray-500 truncate">
                    {item.filename}
                  </p>

                  {/* FORMAT */}
                  <p className="text-[10px] text-gray-400">
                    {item.folder} · {item.format}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
