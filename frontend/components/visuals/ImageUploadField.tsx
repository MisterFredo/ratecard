"use client";

import { useState } from "react";

export default function ImageUploadField({
  label = "Image",
  onUpload,
}: {
  label?: string;
  onUpload: (base64: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    // Preview côté front
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Conversion base64
    const base64 = await fileToBase64(file);
    onUpload(base64);

    setLoading(false);
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const res = reader.result as string;
        const base64 = res.split(",")[1]; // on retire "data:image/jpeg;base64,"
        resolve(base64);
      };
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="space-y-3">
      {/* LABEL */}
      <label className="font-semibold text-sm text-gray-700">{label}</label>

      {/* INPUT */}
      <input
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="text-sm"
      />

      {/* LOADING */}
      {loading && <p className="text-gray-500 text-sm">Traitement…</p>}

      {/* PREVIEW */}
      {preview && (
        <img
          src={preview}
          className="w-40 h-auto border rounded bg-gray-50 shadow-sm"
        />
      )}
    </div>
  );
}
