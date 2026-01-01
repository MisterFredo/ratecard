"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Composant visuel pour l’édition d’un article
 */
export default function ArticleEditVisualSection({
  id_article,
  axes,
  companies,
  title,
  excerpt,
  rectangleId,
  squareId,
  onChangeRectangle,
  onChangeSquare,
}: {
  id_article: string;
  axes: string[];
  companies: string[];

  title: string;
  excerpt: string;

  rectangleId: string | null;
  squareId: string | null;

  onChangeRectangle: (id: string | null) => void;
  onChangeSquare: (id: string | null) => void;
}) {
  const [mode, setMode] = useState<"upload" | "ai">("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  /* ---------------------------------------------------------
     LOAD EXISTING VISUALS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      if (!id_article) return;

      setLoading(true);

      const res = await api.get(`/visuals/article/${id_article}`);
      if (res.status === "ok" && res.visual) {
        setPreviewUrl(res.visual.rectangle_url || null);

        if (res.visual.rectangle_id) onChangeRectangle(res.visual.rectangle_id);
        if (res.visual.square_id) onChangeSquare(res.visual.square_id);
      }

      setLoading(false);
    }

    load();
  }, [id_article]);

  /* ---------------------------------------------------------
     UPLOAD MANUEL
  --------------------------------------------------------- */
  async function onUploadLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      alert("Veuillez d'abord saisir un titre pour nommer le fichier.");
      return;
    }

    const b64 = await fileToBase64(file);

    setUploading(true);

    const res = await api.post("/visuals/article/upload", {
      id_article,
      title,
      base64_image: b64,
    });

    setUploading(false);

    if (res.status !== "ok") {
      alert("Erreur upload visuel");
      return;
    }

    // MAJ des IDs BQ
    onChangeRectangle(res.urls.rectangle_id);
    onChangeSquare(res.urls.square_id);

    // Mise à jour visuel affiché
    setPreviewUrl(res.urls.rectangle_url);
  }

  /* ---------------------------------------------------------
     IA VISUEL
  --------------------------------------------------------- */
  async function generateAI() {
    if (!title.trim()) {
      return alert("Veuillez saisir un titre avant génération IA.");
    }

    setGenerating(true);

    const res = await api.post("/visuals/article/generate-ai", {
      id_article,
      title,
      excerpt,
      axes,
      companies,
    });

    setGenerating(false);

    if (res.status !== "ok") {
      alert("Erreur lors de la génération IA");
      return;
    }

    onChangeRectangle(res.urls.rectangle_id);
    onChangeSquare(res.urls.square_id);

    setPreviewUrl(res.urls.rectangle_url);
  }

  /* ---------------------------------------------------------
     UTILITAIRE — f → base64
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
     RENDER
  --------------------------------------------------------- */
  if (loading) {
    return (
      <div className="p-4 border rounded bg-white">
        <p className="text-gray-500">Chargement du visuel…</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold text-ratecard-blue">
        Visuel de l’article
      </h2>

      {/* ONGLETS */}
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
          onClick={() => setMode("ia")}
        >
          Génération IA
        </button>
      </div>

      {/* MODE UPLOAD */}
      {mode === "upload" && (
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={onUploadLocal}
            disabled={uploading}
            className="border p-2 rounded w-full"
          />
          {uploading && (
            <p className="text-gray-500 text-sm">Traitement…</p>
          )}
        </div>
      )}

      {/* MODE IA */}
      {mode === "ai" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Le visuel IA sera inspiré :
            <br />• de l’axe principal (axes[0]) si présent
            <br />• sinon d’une société associée
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

      {/* IDS TECH */}
      {(rectangleId || squareId) && (
        <div className="text-xs text-gray-400">
          {rectangleId && <p>Rectangle ID : {rectangleId}</p>}
          {squareId && <p>Carré ID : {squareId}</p>}
        </div>
      )}
    </div>
  );
}
