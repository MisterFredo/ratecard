"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUploader from "@/components/admin/MediaUploader";
import { api } from "@/lib/api";

export default function CreateMediaPage() {
  const [category, setCategory] = useState("article");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function onUploadComplete(urls: { square: string; rectangle: string }) {
    // Le MediaUploader a déjà écrit les fichiers sur le disque.
    // On redirige ou on reste ici selon ton choix.
    setResult(urls);

    // Auto-redirection après 1 seconde
    setTimeout(() => {
      window.location.href = "/admin/media";
    }, 800);
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
          <option value="logo">Logo (version source)</option>
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

      {/* Résultat upload (facultatif) */}
      {result && (
        <div className="bg-gray-100 p-4 rounded border space-y-2">
          <p className="text-sm text-gray-700 font-semibold">Média créé :</p>

          <div>
            <p className="text-xs text-gray-600">Square :</p>
            <img src={result.square} className="w-40 border rounded" />
          </div>

          <div>
            <p className="text-xs text-gray-600">Rectangle :</p>
            <img src={result.rectangle} className="w-60 border rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
