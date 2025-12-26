"use client";

import { useState } from "react";

// Types cohérents avec Media Manager V5.5
export type MediaItem = {
  id: string;
  url: string;
  folder: string;
  category: string;
  type: string;
  size: number;
  createdAt: number;
};

export default function MediaUploader({
  category,
  onUploadComplete,
}: {
  category?: string;
  onUploadComplete: (result: { square: MediaItem; rectangle: MediaItem }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file input
  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  // Load image as HTMLImageElement
  function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  }

  // Create a square crop
  async function cropSquare(img: HTMLImageElement): Promise<Blob> {
    const size = 600;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;

    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
    );
  }

  // Create a rectangle crop 1200×628
  async function cropRectangle(img: HTMLImageElement): Promise<Blob> {
    const width = 1200;
    const height = 628;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;

    const ratio = width / height;
    const imgRatio = img.width / img.height;

    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imgRatio > ratio) {
      const newWidth = img.height * ratio;
      sx = (img.width - newWidth) / 2;
      sw = newWidth;
    } else {
      const newHeight = img.width / ratio;
      sy = (img.height - newHeight) / 2;
      sh = newHeight;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
    );
  }

  async function upload() {
    if (!file) return alert("Choisir un fichier d'abord.");

    setLoading(true);

    const img = await loadImage(previewUrl!);

    const squareBlob = await cropSquare(img);
    const rectBlob = await cropRectangle(img);

    const form = new FormData();
    form.append("square", squareBlob, file.name.replace(/\.[^.]+$/, "") + "_square.jpg");
    form.append("rectangle", rectBlob, file.name.replace(/\.[^.]+$/, "") + "_rect.jpg");

    if (category) {
      form.append("category", category);
    }

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();

    setLoading(false);

    if (json.status === "ok") {
      onUploadComplete(json.items); // V5.5 renvoie des objets MediaItem
    } else {
      alert("Erreur upload : " + json.message);
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded bg-white">

      <input type="file" accept="image/*" onChange={onSelect} />

      {previewUrl && (
        <img
          src={previewUrl}
          className="w-40 h-40 object-cover border rounded mt-2"
        />
      )}

      <button
        onClick={upload}
        disabled={loading}
        className="bg-ratecard-green text-white px-4 py-2 rounded"
      >
        {loading ? "Traitement…" : "Uploader"}
      </button>
    </div>
  );
}
