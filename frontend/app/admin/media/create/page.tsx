"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUploader from "@/components/admin/MediaUploader";

export default function CreateMediaPage() {
  // Catégorie sélectionnée
  const [category, setCategory] = useState("logos");

  // Nouveau : TITRE du média
  const [title, setTitle] = useState("");

  const [result, setResult] = useState<{
    square: { media_id: string; url: string };
    rectangle: { media_id: string; url: string };
    original: { media_id: string; url: string };
  } | null>(null);

  function onUploadComplete(res: any) {
    setResult(res);
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

      {/* TITRE */}
      <div className="space-y-2">
        <label className="font-semibold text-sm">Titre du média</label>
        <p className="text-xs text-gray-500">
          Ce titre servira à générer automatiquement les noms de fichiers.
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: ADEX_PROGRAMMATIQUE"
          className="border rounded p-2 w-full"
        />
      </div>

      {/* CHOIX CATEGORIE */}
      <div className="space-y-2">
        <label className="font-semibold text-sm">Catégorie du média</label>

        <p className="text-xs text-gray-500 mb-1">
          Ces catégories servent uniquement à organiser la médiathèque.
        </p>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="logos">Logos (originaux)</option>
          <option value="logos-cropped">Logos formatés (carré & rect.)</option>
          <option value="generics">Visuels génériques Ratecard</option>
        </select>
      </div>

      {/* UPLOADER */}
      <div className="border rounded bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-ratecard-blue">
          Uploader une image
        </h2>

        <MediaUploader
          category={category}
          title={title}                 // 🆕 indispensable
          onUploadComplete={onUploadComplete}
        />
      </div>

      {/* RESULT */}
      {result && (
        <div className="bg-gray-100 p-4 rounded border space-y-4">

          <p className="text-sm text-gray-700 font-semibold">
            Média ajouté :
          </p>

          {/* ORIGINAL */}
          <div>
            <p className="text-xs text-gray-600">Original</p>
            <img
              src={result.original.url}
              className="w-48 border rounded bg-white"
            />
            <p className="text-[10px] text-gray-500 break-all mt-1">
              {result.original.url}
            </p>
          </div>

          {/* SQUARE */}
          <div>
            <p className="text-xs text-gray-600">Carré (1:1)</p>
            <img
              src={result.square.url}
              className="w-32 border rounded bg-white"
            />
            <p className="text-[10px] text-gray-500 break-all mt-1">
              {result.square.url}
            </p>
          </div>

          {/* RECTANGLE */}
          <div>
            <p className="text-xs text-gray-600">Rectangle (4:3)</p>
            <img
              src={result.rectangle.url}
              className="w-48 border rounded bg-white"
            />
            <p className="text-[10px] text-gray-500 break-all mt-1">
              {result.rectangle.url}
            </p>
          </div>

          {/* BOUTON RETOUR */}
          <button
            onClick={() => (window.location.href = "/admin/media")}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            Retour à la médiathèque
          </button>
        </div>
      )}
    </div>
  );
}

