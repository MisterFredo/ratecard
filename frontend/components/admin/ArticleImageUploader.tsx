"use client";

import { useState } from "react";

export default function ArticleImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: (result: {
    rectangle_url: string;
    square_url: string;
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

  async function upload() {
    if (!file) {
      alert("Merci de sélectionner un fichier.");
      return;
    }

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/article/upload-image", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setLoading(false);

    if (json.status !== "ok") {
      alert("Erreur upload image article : " + json.message);
      return;
    }

    onUploadComplete({
      rectangle_url: json.rectangle_url,
      square_url: json.square_url,
    });
  }

  return (
    <div className="space-y-4 p-4 border rounded bg-white">

      <input type="file" accept="image/*" onChange={onSelect} />

      {previewUrl && (
        <img
          src={previewUrl}
          className="w-40 h-40 object-cover border rounded bg-gray-50"
        />
      )}

      <button
        onClick={upload}
        disabled={loading || !file}
        className={`px-4 py-2 rounded text-white font-medium transition ${
          loading || !file
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-ratecard-blue hover:bg-blue-700"
        }`}
      >
        {loading ? "Traitement…" : "Uploader l’image"}
      </button>
    </div>
  );
}
