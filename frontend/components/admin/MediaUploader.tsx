"use client";

import { useState } from "react";

/* ---------------------------------------------------------
   Nouveau type MEDIA (gouverné par BigQuery)
--------------------------------------------------------- */
export type UploadedMedia = {
  media_id: string;     // 🆕 BigQuery ID_MEDIA
  url: string;          // /media/<folder>/<name>
  format: "rectangle" | "square" | "original";
  folder: string;
};

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
export default function MediaUploader({
  category = "articles",
  onUploadComplete,
}: {
  category?: string;
  onUploadComplete: (result: {
    square: UploadedMedia;
    rectangle: UploadedMedia;
    original?: UploadedMedia;
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

    setLoading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("category", category);

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
       json.items contient :
       {
         original: { id, url, folder },
         rectangle: { id, url, folder },
         square: { id, url, folder }
       }

       MAIS → nous devons enrichir ces infos avec les media_id
       enregistrés dans BigQuery
    --------------------------------------------------------- */

    const findMediaId = async (fileUrl: string): Promise<string | null> => {
      const bqPath = fileUrl.replace("/media/", "/uploads/media/");
      const query = await fetch(
        `/api/media/find?filepath=${encodeURIComponent(bqPath)}`
      );
      const result = await query.json();
      return result.media_id || null;
    };

    const squareUrl = json.items.square.url;
    const rectUrl = json.items.rectangle.url;
    const originalUrl = json.items.original.url;

    const squareId = await findMediaId(squareUrl);
    const rectId = await findMediaId(rectUrl);
    const originalId = await findMediaId(originalUrl);

    onUploadComplete({
      square: {
        media_id: squareId,
        url: squareUrl,
        format: "square",
        folder: category,
      },
      rectangle: {
        media_id: rectId,
        url: rectUrl,
        format: "rectangle",
        folder: category,
      },
      original: {
        media_id: originalId,
        url: originalUrl,
        format: "original",
        folder: category,
      },
    });
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      {/* INPUT */}
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

