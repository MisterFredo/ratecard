"use client";

import { useState } from "react";

export default function MediaUploader({ onUploadComplete }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // -----------------------
  // GENERATE IMAGE VARIANTS
  // -----------------------
  async function generateVariants(imageFile: File) {
    const img = await loadImage(URL.createObjectURL(imageFile));

    const square = await resizeToSquare(img, 600);
    const rectangle = await resizeToRectangle(img, 1200, 400);

    return { square, rectangle };
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }

  function resizeToSquare(img: HTMLImageElement, size: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
    });
  }

  function resizeToRectangle(
    img: HTMLImageElement,
    width: number,
    height: number
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      const ratio = width / height;
      const imgRatio = img.width / img.height;

      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;

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
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
    });
  }

  // -----------------------
  // UPLOAD
  // -----------------------
  async function upload() {
    if (!file) return alert("Veuillez sélectionner un fichier");

    setLoading(true);

    const { square, rectangle } = await generateVariants(file);

    const form = new FormData();
    form.append("square", square, `${file.name.split(".")[0]}_square.jpg`);
    form.append("rectangle", rectangle, `${file.name.split(".")[0]}_rect.jpg`);

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    setLoading(false);

    if (json.status === "ok") {
      onUploadComplete(json.urls); // renvoie { square: "...", rectangle: "..." }
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">

      <input
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="block"
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-40 h-40 object-cover rounded border"
        />
      )}

      <button
        className="bg-ratecard-green text-white px-4 py-2 rounded"
        onClick={upload}
        disabled={loading}
      >
        {loading ? "Traitement..." : "Uploader"}
      </button>
    </div>
  );
}
