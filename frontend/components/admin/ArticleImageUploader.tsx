"use client";

import { useState } from "react";
import Image from "next/image";

import { api } from "@/lib/api";

export default function ArticleImageUploader({
  articleId,
  title,
  onUploadComplete,
}: {
  articleId: string;
  title: string;
  onUploadComplete: (r: {
    rectangle_url: string;
    square_url: string;
  }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // Select local file
  // -----------------------------------------
  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // -----------------------------------------
  // Upload to backend → GCS
  // -----------------------------------------
  async function upload() {
    if (!file) {
      alert("Merci de sélectionner un fichier.");
      return;
    }

    if (!title.trim()) {
      alert("Merci de renseigner un titre d’article avant l’upload.");
      return;
    }

    setLoading(true);

    // Convertir en base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const payload = {
      id_article: articleId,
      title,
      base64_image: base64,
    };

    const res = await api.post("/visuals/articles/upload", payload);

    setLoading(false);

    if (res.status !== "ok") {
      console.error("❌ Upload error:", res);
      alert("Erreur upload visuel : " + (res.detail || res.message));
      return;
    }

    onUploadComplete({
      rectangle_url: res.urls.rectangle,
      square_url: res.urls.square,
    });
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="space-y-4 p-4 border rounded bg-white shadow-sm">

      <input type="file" accept="image/*" onChange={onSelect} />

      {preview && (
        <Image
          src={preview}
          alt="preview"
          width={300}
          height={200}
          className="border rounded mt-2 object-contain bg-gray-50"
        />
      )}

      <button
        onClick={upload}
        disabled={loading || !file}
        className={`px-4 py-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-ratecard-blue hover:bg-blue-700"
        }`}
      >
        {loading ? "Traitement…" : "Uploader l’image"}
      </button>
    </div>
  );
}
