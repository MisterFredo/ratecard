"use client";

import { useEffect, useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any>({
    logos: [],
    logosCropped: [],
    articles: [],
    generics: [],
  });

  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>("logos");

  // --------------------------
  // Load media
  // --------------------------
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
    load();
  }, []);

  // --------------------------
  // Delete file
  // --------------------------
  async function deleteFile(url: string) {
    if (!confirm("Supprimer ce fichier ?")) return;
    await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    load();
  }

  // --------------------------
  // Category renderer
  // --------------------------
  function Category({ title, files, keyName }) {
    const isOpen = openCategory === keyName;

    return (
      <div className="border rounded bg-white overflow-hidden">

        {/* HEADER */}
        <div
          className="flex justify-between items-center px-4 py-3 cursor-pointer bg-gray-100 hover:bg-gray-200"
          onClick={() => setOpenCategory(isOpen ? null : keyName)}
        >
          <h3 className="font-semibold text-ratecard-blue">{title}</h3>
          <span className="text-gray-600 text-sm">{isOpen ? "▼" : "▶"}</span>
        </div>

        {/* CONTENT */}
        {isOpen && (
          <div className="p-4">

            {loading ? (
              <p className="text-gray-500">Chargement…</p>
            ) : files.length === 0 ? (
              <p className="text-gray-400 italic">Aucun visuel pour le moment.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((url: string) => (
                  <div
                    key={url}
                    className="border rounded-lg p-2 bg-white shadow-sm flex flex-col items-center"
                  >
                    <img
                      src={url}
                      className="w-full h-24 object-contain rounded border bg-gray-50"
                    />
                    <p className="text-[10px] text-gray-500 break-all mt-1">{url}</p>

                    <button
                      className="text-red-600 text-xs underline mt-1"
                      onClick={() => deleteFile(url)}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-10">

      <h1 className="text-3xl font-semibold text-ratecard-blue">Media Library</h1>

      {/* UPLOAD ZONE */}
      <div className="border rounded bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-ratecard-blue">
          Ajouter un visuel
        </h2>

        <MediaUploader
          onUploadComplete={() => {
            load();
          }}
        />
      </div>

      {/* CATEGORIES */}
      <Category
        keyName="logos"
        title="Logos (originaux)"
        files={media.logos}
      />

      <Category
        keyName="logosCropped"
        title="Logos formatés (square + rect)"
        files={media.logosCropped}
      />

      <Category
        keyName="articles"
        title="Visuels d’articles"
        files={media.articles}
      />

      <Category
        keyName="generics"
        title="Visuels génériques"
        files={media.generics}
      />
    </div>
  );
}
