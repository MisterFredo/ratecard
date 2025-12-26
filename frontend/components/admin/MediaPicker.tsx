"use client";

import { useEffect, useState } from "react";
import Drawer from "@/components/ui/Drawer";

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  category = "all", // "logos", "logos-cropped", "articles", "generics", or "all"
}) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<any>({
    logos: [],
    logosCropped: [],
    articles: [],
    generics: [],
  });

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

  function renderSection(title: string, files: string[]) {
    if (category !== "all" && category !== title) return null;

    return (
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>

        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">Aucun visuel.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {files.map((url) => (
              <div
                key={url}
                className="border rounded p-2 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  onSelect(url);
                  onClose();
                }}
              >
                <img
                  src={url}
                  className="w-full h-24 object-contain rounded"
                />
                <p className="text-xs mt-1 break-all text-gray-500">{url}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-ratecard-blue mb-4">
          Choisir un visuel
        </h2>

        {renderSection("logos", media.logos)}
        {renderSection("logos-cropped", media.logosCropped)}
        {renderSection("articles", media.articles)}
        {renderSection("generics", media.generics)}
      </div>
    </Drawer>
  );
}
