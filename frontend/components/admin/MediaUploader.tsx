"use client";

import { useState } from "react";

export default function MediaUploader({
  category = "articles",
  onUploadComplete,
}: {
  category?: string;
  onUploadComplete: (items: any) => void;
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
    if (!file) return alert("Merci de sélectionner un fichier");

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

    onUploadComplete(json.items); // {square, rectangle, original}
  }

  return (
    <div className="space-y-4 p-5 border rounded-xl bg-white shadow-sm">

      {/* FILE SELECT */}
      <label className="block text-sm font-medium text-gray-700">
        Sélectionner un fichier image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={onSelect}
        className="text-sm"
      />

      {/* PREVIEW */}
      {previewUrl && (
        <div className="mt-3">
          <img
            src={previewUrl}
            className="w-40 h-40 object-cover rounded-lg border bg-gray-50"
          />
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <button
        onClick={upload}
        disabled={loading || !file}
        className={`px-5 py-2 rounded-lg text-white font-medium transition ${
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
