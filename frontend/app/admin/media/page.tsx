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

  // ---------------------------------------
  // Load all media files from API
  // ---------------------------------------
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

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Media Library
        </h1>
      </div>

      {/* UPLOAD ZONE */}
      <div className="bg-white p-4 rounded border shadow-sm">
        <h2 className="text-xl font-semibold mb-3 text-ratecard-blue">
          Ajouter un visuel
        </h2>
        <MediaUploader
          onUploadComplete={(urls) => {
            console.log("Upload ok :", urls);
            load();
          }}
        />
      </div>


      {/* ============================ */}
      {/*  CATEGORY : LOGOS SOURCE     */}
      {/* ============================ */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Logos (source)</h3>
        {loading ? (
          <p>Chargement…</p>
        ) : media.logos.length === 0 ? (
          <p className="text-gray-500">Aucun logo.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {media.logos.map((url: string) => (
              <div key={url} className="border p-2 rounded bg-white">
                <img src={url} className="w-full h-24 object-contain" />
                <p className="text-xs mt-1 break-all">{url}</p>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ============================ */}
      {/*  CATEGORY : LOGOS CROPPED   */}
      {/* ============================ */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Logos formatés (carré + rect)</h3>
        {loading ? (
          <p>Chargement…</p>
        ) : media.logosCropped.length === 0 ? (
          <p className="text-gray-500">Aucun logo formaté.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {media.logosCropped.map((url: string) => (
              <div key={url} className="border p-2 rounded bg-white">
                <img src={url} className="w-full h-24 object-contain" />
                <p className="text-xs mt-1 break-all">{url}</p>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ============================ */}
      {/*  CATEGORY : ARTICLES         */}
      {/* ============================ */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Visuels d’articles</h3>
        {loading ? (
          <p>Chargement…</p>
        ) : media.articles.length === 0 ? (
          <p className="text-gray-500">Aucun visuel article.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {media.articles.map((url: string) => (
              <div key={url} className="border p-2 rounded bg-white">
                <img src={url} className="w-full h-24 object-cover rounded" />
                <p className="text-xs mt-1 break-all">{url}</p>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ============================ */}
      {/*  CATEGORY : GENERICS         */}
      {/* ============================ */}
      <section>
        <h3 className="text-xl font-semibold mb-3">Visuels génériques</h3>
        {loading ? (
          <p>Chargement…</p>
        ) : media.generics.length === 0 ? (
          <p className="text-gray-500">Aucun visuel générique.</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {media.generics.map((url: string) => (
              <div key={url} className="border p-2 rounded bg-white">
                <img src={url} className="w-full h-24 object-cover rounded" />
                <p className="text-xs mt-1 break-all">{url}</p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
