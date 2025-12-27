"use client";

import { useState } from "react";

/* ---------------------------------------------------------
   Type du média renvoyé par l'upload
--------------------------------------------------------- */
export type UploadedMedia = {
  media_id: string;
  url: string;
  format: "rectangle" | "square" | "original";
  folder: string;
};

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
export default function MediaUploader({
  category = "logos",
  title,                              // 🆕 titre du média
  onUploadComplete,
}: {
  category?: string;
  title: string;                      // 🆕 obligatoire
  onUploadComplete: (result: {
    square: UploadedMedia;
    rectangle: UploadedMedia;
    original: UploadedMedia;
  }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  /* ---------------------------------------------------------
     UPLOAD
  --------------------------------------------------------- */
  async function upload() {
    if (!file) {
      alert("Merci de sélectionner un fichier.");
      return;
    }

    if (!title.trim()) {
      alert("Merci de saisir un titre.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    form.append("title", title);          // 🆕 envoi du titre à l’API Next.js

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setLoading(false);

    if (json.status !== "ok") {
      alert("Erreur upload : " + json.message);
      return;
    }

    /* ---------------------------------------------------------
       json.items contient déjà :
       - original   { media_id, url }
       - rectangle  { media_id, url }
       - square     { media_id, url }
    --------------------------------------------------------- */

    onUploadComplete({
      original: json.items.original,
      rectangle: json.items.rectangle,
      square: json.items.square,
    });
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">

      {/* INPUT FILE */}
      <input
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="text-sm"
      />

      {/* PREVIEW */}
      {previewUrl && (
        <img
          src={previewUrl}
          className="w-40 h-40 object-cover border rounded mt-2 bg-gray-50"
        />
      )}

      {/* BUTTON */}
      <button
        onClick={upload}
        disabled={loading || !file}
        className={`px-4 py-2 rounded text-white font-medium transition ${
          loading || !file
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-ratecard-green hover:bg-green-600"
        }`}
      >
        {loading ? "Traitement…" : "Uploader"}
      </button>
    </div>
  );
}

