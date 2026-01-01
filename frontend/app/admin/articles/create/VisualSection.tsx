"use client";

import { useState } from "react";
import { api } from "@/lib/api";

/**
 * Props du composant
 */
export default function ArticleVisualSection({
  axes,
  companies,
  title,
  excerpt,
  rectangleId,
  squareId,
  onChangeRectangle,
  onChangeSquare,
}: {
  axes: string[];               // liste d'axes ID
  companies: string[];          // liste de sociétés ID
  title: string;
  excerpt: string;

  rectangleId: string | null;
  squareId: string | null;

  onChangeRectangle: (id: string | null) => void;
  onChangeSquare: (id: string | null) => void;
}) {
  const [mode, setMode] = useState<"upload" | "ai">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  /* ---------------------------------------------------------
     UPLOAD MANUEL → backend /visuals/article/upload
  --------------------------------------------------------- */
  async function onUploadLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const id_article = "pending"; // l'article n'est pas encore créé
    const titleSafe = title || "ARTICLE";

    const b64 = await fileToBase64(file);

    setUploading(true);

    const res = await api.post("/visuals/article/upload", {
      id_article,
      title: titleSafe,
      base64_image: b64,
    });

    setUploading(false);

    if (res.status !== "ok") {
      alert("Erreur upload visuel");
      return;
    }

    // Mise à jour des IDs BQ
    onChangeRectangle(res.urls.rectangle_id);
    onChangeSquare(res.urls.square_id);

    // Mise à jour visuel (rectangle affiché)
    setPreviewUrl(res.urls.rectangle_url);
  }

  /* ---------------------------------------------------------
     IA VISUEL → backend /visuals/article/generate-ai
  --------------------------------------------------------- */
  async function generateAI() {
    if (!title.trim()) return alert("Veuillez saisir un titre d’abord");

    setGenerating(true);

    const res = await api.post("/visuals/article/generate-ai", {
      id_article: "pending",
      title,
      excerpt,
      axe_visual_square_url: null,       // le backend reconstruit depuis axes[0]
      company_visual_square_url: null,   // le backend reconstruit depuis société
      axes,
      companies,
    });

    setGenerating(false);

    if (res.status !== "ok") {
      alert("Erreur IA visuel");
      return;
    }

    onChangeRectangle(res.urls.rectangle_id);
    onChangeSquare(res.urls.square_id);

    setPreviewUrl(res.urls.rectangle_url);
  }

  /* ---------------------------------------------------------
     Utilitaire : fichier → base64
  --------------------------------------------------------- */
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve((reader.result as string).replace(/^data:.+;base64,/, ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------
     RENDER UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* TABS */}
      <div className="flex gap-6 border-b pb-2">
        <button
          className={
            mode === "upload"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }
          onClick={() => setMode("upload")}
        >
          Upload
        </button>

        <button
          className={
            mode === "ai"
              ? "border-b-2 border-ratecard-blue font-semibold"
              : "text-gray-500"
          }
          onClick={() => setMode("ai")}
        >
          Génération IA
        </button>
      </div>

      {/* MODE UPLOAD */}
      {mode === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={onUploadLocal}
            disabled={uploading}
            className="border p-2 rounded w-full"
          />

          {uploading && (
            <p className="text-sm text-gray-500">Traitement…</p>
          )}
        </div>
      )}

      {/* MODE IA */}
      {mode === "ai" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Le visuel IA sera inspiré :
            <br />• de l’axe principal (axes[0]) s’il existe
            <br />• sinon de la société principale
            <br />• sinon du titre + résumé
          </p>

          <button
            onClick={generateAI}
            disabled={generating}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {generating ? "Génération…" : "Générer via IA"}
          </button>
        </div>
      )}

      {/* APERÇU FINAL */}
      {previewUrl && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
          <img
            src={previewUrl}
            className="w-80 border rounded bg-white shadow"
          />
        </div>
      )}

      {/* INFO TECH */}
      {(rectangleId || squareId) && (
        <div className="text-xs text-gray-400">
          <p>Rectangle ID : {rectangleId}</p>
          <p>Carré ID : {squareId}</p>
        </div>
      )}
    </div>
  );
}
