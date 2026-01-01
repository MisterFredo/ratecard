"use client";

import { useState } from "react";
import Image from "next/image";

export default function ArticleImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: (result: {
    rectangle_id: string;
    rectangle_url: string;
    square_id: string;
    square_url: string;
  }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* --------------------------------------------
     SÉLECTION FICHIER
  -------------------------------------------- */
  function selectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  /* --------------------------------------------
     UPLOAD MAXI SIMPLE → Next.js → Backend
  -------------------------------------------- */
  async function upload() {
    if (!file) return alert("Sélectionne une image.");

    setLoading(true);

    // Conversion file → base64 pour backend
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const res = await fetch("/visuals/article/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_article: "temp", // Pour création → remplacé ensuite par Edit
        title: file.name.replace(/\.[^.]+$/, ""),
        base64_image: base64,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (json.status !== "ok") {
      alert("Erreur upload article : " + json.detail || json.message);
      return;
    }

    onUploadComplete({
      rectangle_id: json.media_rectangle_id,
      rectangle_url: json.urls.rectangle,
      square_id: json.media_square_id,
      square_url: json.urls.square,
    });
  }

  /* --------------------------------------------
     UI
  -------------------------------------------- */
  return (
    <div className="space-y-4 p-4 border rounded bg-white shadow">

      <input
        type="file"
        accept="image/*"
        onChange={selectFile}
        className="text-sm"
      />

      {previewUrl && (
        <Image
          src={previewUrl}
          alt="preview"
          width={300}
          height={200}
          className="border rounded object-contain bg-gray-100"
        />
      )}

      <button
        onClick={upload}
        disabled={!file || loading}
        className={`px-4 py-2 rounded text-white font-medium ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Traitement…" : "Uploader et générer formats"}
      </button>
    </div>
  );
}
