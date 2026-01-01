"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Mode = "upload" | "ai";

export default function VisualSection({
  article,
  onChange,
  axes,
  companies,
}: {
  article: any;
  onChange: (rectUrl: string | null, squareUrl: string | null) => void;
  axes: any[];
  companies: any[];
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const [loadingAI, setLoadingAI] = useState(false);

  const rectPath = article?.media_rectangle_path;
  const squarePath = article?.media_square_path;

  const rectUrl = rectPath ? `${GCS_BASE_URL}/${rectPath}` : null;
  const squareUrl = squarePath ? `${GCS_BASE_URL}/${squarePath}` : null;

  /* ---------------------------------------------------------
      UPLOAD MANUEL
  --------------------------------------------------------- */
  async function handleManualUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);

    const payload = {
      id_article: article.ID_ARTICLE,
      title: article.TITRE,
      base64_image: base64,
    };

    const res = await api.post("/visuals/article/upload", payload);

    if (res.status === "ok") {
      onChange(res.urls.rectangle, res.urls.square);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve((reader.result as string).replace(/^data:.*;base64,/, ""));
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------
      IA VISUEL ARTICLE
      (uniquement influences → axes)
  --------------------------------------------------------- */
  async function generateAI() {
    setLoadingAI(true);

    const primaryAxe = axes?.[0] ?? null;
    const axeVisual = primaryAxe?.media_square_url ?? null;

    const payload = {
      id_article: article.ID_ARTICLE,
      title: article.TITRE,
      excerpt: article.RESUME || "",
      axe_visual_square_url: axeVisual,
      company_visual_square_url: null, // ❌ interdit comme décidé
    };

    const res = await api.post("/visuals/article/generate-ai", payload);

    if (res.status === "ok") {
      onChange(res.urls.rectangle, res.urls.square);
    }

    setLoadingAI(false);
  }

  /* ---------------------------------------------------------
      UI
  --------------------------------------------------------- */
  return (
    <div className="border rounded p-4 space-y-4 bg-white">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* Onglets */}
      <div className="flex gap-4 border-b pb-2">
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
          <input type="file" accept="image/*" onChange={handleManualUpload} />
        </div>
      )}

      {/* MODE IA */}
      {mode === "ai" && (
        <div className="space-y-3">
          <button
            onClick={generateAI}
            disabled={loadingAI}
            className="bg-ratecard-blue text-white px-4 py-2 rounded"
          >
            {loadingAI ? "Génération…" : "Générer via IA"}
          </button>

          {axes.length === 0 && (
            <p className="text-xs text-red-500">
              ⚠️ Aucun axe assigné → IA impossible (obligatoire).
            </p>
          )}
        </div>
      )}

      {/* APERÇU */}
      {rectUrl && (
        <div>
          <p className="text-xs text-gray-500">Aperçu :</p>
          <img
            src={rectUrl}
            className="w-96 rounded border shadow bg-white"
          />
        </div>
      )}
    </div>
  );
}
