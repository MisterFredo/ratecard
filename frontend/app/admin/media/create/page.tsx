"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUploader, { MediaItem } from "@/components/admin/MediaUploader";

export default function CreateMediaPage() {
  const [category, setCategory] = useState("article");
  const [result, setResult] = useState<{
    square: MediaItem;
    rectangle: MediaItem;
  } | null>(null);

  function onUploadComplete(result: {
    square: MediaItem;
    rectangle: MediaItem;
  }) {
    setResult(result);

    // Auto redirection après courte pause UX
    setTimeout(() => {
      window.location.href = "/admin/media";
    }, 600);
  }

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Ajouter un média
        </h1>

        <Link href="/admin/media" className="underline text-gray-600">
          ← Retour
        </Link>
      </div>

      {/* CHOIX CATEGORIE */}
      <div className="space-y-2">
        <label className="font-semibold text-sm">Catégorie du média</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="article">Visuel d’article</option>
          <option value="logo">Logo (source)</option>
          <option value="generic">Visuel générique (Ratecard)</option>
          <option value="ia">Visuel IA généré</option>
        </select>
      </div>

      {/* UPLOADER */}
      <div className="border rounded bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-ratecard-blue">
          Uploader une image
        </h2>

        <MediaUploader
          category={category}
          onUploadComplete={onUploadComplete}
        />
      </div>

      {/* AFFICHAGE RESULTAT */}
      {result && (
        <div className="bg-gray-100 p-4 rounded border space-y-4">

          <p className="text-sm text-gray-700 font-semibold">
            Média créé :
          </p>

          {/* SQUARE */}
          <div>
            <p className="text-xs text-gray-600">Square :</p>
            <img
              src={result.square.url}
              className="w-40 border rounded"
            />
            <p className="text-[10px] text-gray-500 break-all mt-1">
              {result.square.url}
            </p>
          </div>

          {/* RECTANGLE */}
          <div>
            <p className="text-xs text-gray-600">Rectangle :</p>
            <img
              src={result.rectangle.url}
              className="w-60 border rounded"
            />
            <p className="text-[10px] text-gray-500 break-all mt-1">
              {result.rectangle.url}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
