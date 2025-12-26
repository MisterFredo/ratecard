"use client";

import { useEffect, useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any>({
    logos: [],
    logosCropped: [],
    articles: [],
    generics: []
  });

  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>("logos");

  // --------------------------
  // Load media list
  // --------------------------
  async function load() {
    setLoading(true);
    const res = await fetch("/api/media/list");
    const json = await res.json();
    if (json.status === "ok") setMedia(json.media);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // --------------------------
  // Delete one media file
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
  // Render a collapsible section
  // --------------------------
  function Category({ title, list, keyName }) {
    const isOpen = openCategory === keyName;

    return (
      <div className="border rounded bg-white">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50"
          onClick={() => setOpenCategory(isOpen ? null : keyName)}
        >
          <h3 className="text-lg font-semibold text-ratecard-blue">{title}</h3>
          <span className="text-gray-500">{isOpen ? "▼" : "▶"}</span>
        </div>

        {isOpen && (
          <div className="p-4 space-y-4">
            {loading ? (
              <p className="text-gray-500">Chargement…</p>
            ) : list.length === 0 ? (
              <p className="text-gray-500 italic">Aucun fichier.</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {list.map((url: string) => (
                  <div key={url} className="border p-2 rounded bg-white">
                    <img
                      src={url}
                      className="w-full h-24 object-contain rounded border"
                    />
                    <p className="text-xs text-gray-500 break-all mt-1">{url}</p>

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

      {/* HEADER */}
      <h1 className="text-3xl font-semibold text-ratecard-blue">
        Media Library
      </h1>

      {/* UPLOAD */}
      <div className="bg-white p-4 rounded border shadow-sm">
        <h2 className="text-xl font-semibold text-ratecard-blue mb-3">
          Ajouter un visuel
        </h2>

        <MediaUploader
          onUploadComplete={(urls) => {
            console.log("Upload OK:", urls);
            load();
          }}
        />
      </div>

      {/* CATEGORIES */}
      <Category
        title="Logos (originaux)"
        list={media.logos}
        keyName="logos"
      />

      <Category
        title="Logos formatés (square + rect)"
        list={media.logosCropped}
        keyName="logosCropped"
      />

      <Category
        title="Visuels d’articles"
        list={media.articles}
        keyName="articles"
      />

      <Category
        title="Visuels génériques"
        list={media.generics}
        keyName="generics"
      />

    </div>
  );
}
