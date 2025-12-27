"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";

export type PickerMediaItem = {
  id: string;           // filename
  url: string;          // /media/<folder>/<file>
  folder: string;       // logos, articles, generics, ia…
  type?: string;        // original | rect | square
  category?: string;
  media_id?: string;    // 🆕 ID BigQuery
  bq_format?: string;   // 🆕 original | rectangle | square
  entity_type?: string; // 🆕 axe | company | person | article
  entity_id?: string;   // 🆕 ID_AXE …
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "logos-cropped",
}: {
  open: boolean;
  onClose: () => void;

  // 🆕 now returns metadata
  onSelect: (item: {
    media_id: string | null;
    url: string;
    format: string | null;
    folder: string;
  }) => void;

  category?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<PickerMediaItem[]>([]);

  /* ----------------------------------------
     LOAD MEDIA
  ---------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await fetch("/api/media/list");
    const json = await res.json();

    if (json.status === "ok") {
      setMedia(json.media);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  /* ----------------------------------------
     FILTRAGE PAR DOSSIER
  ---------------------------------------- */
  const filtered =
    category === "all"
      ? media
      : media.filter((m) => m.folder === category);

  return (
    <Drawer open={open} onClose={onClose} title="Choisir un visuel" size="lg">
      <div className="space-y-6">

        {/* LOADING */}
        {loading && <p className="text-gray-500 text-sm">Chargement…</p>}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 italic text-sm">
            Aucun visuel disponible dans cette catégorie.
          </p>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((item) => {
              const assigned = item.entity_type && item.entity_id;

              return (
                <div
                  key={item.id}
                  className={`border rounded p-2 bg-white hover:bg-gray-50 cursor-pointer transition relative ${
                    assigned ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => {
                    onSelect({
                      media_id: item.media_id || null,
                      url: item.url,
                      format: item.bq_format || null,
                      folder: item.folder,
                    });

                    onClose();
                  }}
                >
                  {/* BADGE - Already linked */}
                  {assigned && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Assigné
                    </span>
                  )}

                  <img
                    src={item.url}
                    alt={item.id}
                    className="w-full h-24 object-contain rounded bg-gray-50 border"
                  />

                  <p className="text-[10px] mt-1 break-all text-gray-700">
                    {item.id}
                  </p>

                  <p className="text-[10px] text-gray-400">
                    {item.folder} · {item.type || item.bq_format}
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

