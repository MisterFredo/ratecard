"use client";

import { useState } from "react";
import sharp from "sharp-browser";

/* ---------------------------------------------------------
   Type du média renvoyé par l'upload GCS
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
  title,
  onUploadComplete,
}: {
  category?: string;
  title: string;
  onUploadComplete: (result: {
    square: UploadedMedia;
    rectangle: UploadedMedia;
    original: UploadedMedia;
  }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     PICK FILE
  --------------------------------------------------------- */
  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  /* ---------------------------------------------------------
     Convert file → base64
  --------------------------------------------------------- */
  async function fileToBase64(file: File) {
    const buf = Buffer.from(await file.arrayBuffer());
    return buf.toString("base64");
  }

  /* ---------------------------------------------------------
     Generate square (600x600) + rectangle (1200x900)
     in-browser using sharp-browser
  --------------------------------------------------------- */
  async function createSquare(base: ArrayBuffer) {
    return sharp(Buffer.from(base))
      .resize(600, 600, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  async function createRectangle(base: ArrayBuffer) {
    return sharp(Buffer.from(base))
      .resize(1200, 900, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  /* ---------------------------------------------------------
     UPLOAD TO BACKEND → GCS → BigQuery
  --------------------------------------------------------- */
  async function upload() {
    if (!file) return alert("Merci de sélectionner un fichier.");
    if (!title.trim()) return alert("Merci de fournir un titre.");

    setLoading(true);

    const originalBase64 = await fileToBase64(file);
    const buffer = await file.arrayBuffer();
    const squareBuf = await createSquare(buffer);
    const rectBuf = await createRectangle(buffer);

    async function uploadOne(filename: string, format: string, buf: Buffer | string) {
      const base64 = typeof buf === "string" ? buf : buf.toString("base64");

      const res = await fetch("/api/media/register-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          category,
          format,
          title,
          base64
        }),
      });

      return res.json();
    }

    const safeTitle = title.replace(/\s+/g, "_").replace(/[^A-Za-z0-9_\-]/g, "");

    const original = await uploadOne(`${safeTitle}_original.jpg`, "original", originalBase64);
    const rectangle = await uploadOne(`${safeTitle}_rect.jpg`, "rectangle", rectBuf);
    const square = await uploadOne(`${safeTitle}_square.jpg`, "square", squareBuf);

    setLoading(false);

    if (!original?.item || !rectangle?.item || !square?.item) {
      alert("❌ Erreur upload des différentes variantes");
      return;
    }

    onUploadComplete({
      original: original.item,
      rectangle: rectangle.item,
      square: square.item,
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



