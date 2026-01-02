"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Topic = {
  id_topic: string;
  label: string;
};

type Props = {
  articleId: string;
  title: string;
  excerpt: string;
  topics: Topic[];
};

export default function ArticleVisualSection({
  articleId,
  title,
  excerpt,
  topics,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [squareFilename, setSquareFilename] = useState<string | null>(null);
  const [rectFilename, setRectFilename] = useState<string | null>(null);

  /* ---------------------------------------------------------
     UTILS
  --------------------------------------------------------- */
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const res = reader.result?.toString() || "";
        resolve(res.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------
     UPLOAD MANUEL
  --------------------------------------------------------- */
  async function upload(file: File, format: "square" | "rectangle") {
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/article/upload", {
        id_article: articleId,
        format,
        base64_image: base64,
      });

      if (format === "square") setSquareFilename(res.filename);
      if (format === "rectangle") setRectFilename(res.filename);
    } catch (e) {
      console.error(e);
      alert("Erreur upload visuel");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     RESET VISUEL
  --------------------------------------------------------- */
  async function resetVisual() {
    if (!confirm("Supprimer le visuel de l’article ?")) return;

    setLoading(true);
    try {
      await api.post("/visuals/article/reset", {
        id_article: articleId,
      });
      setSquareFilename(null);
      setRectFilename(null);
    } catch (e) {
      console.error(e);
      alert("Erreur reset visuel");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     GÉNÉRATION IA
  --------------------------------------------------------- */
  async function generateAI() {
    if (!topics || topics.length === 0) {
      alert("Au moins un topic est requis pour la génération IA");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/visuals/article/generate-ai", {
        id_article: articleId,
        title,
        excerpt,
        topics: topics.map((t) => t.label),
      });

      setSquareFilename(res.filenames.square);
      setRectFilename(res.filenames.rectangle);
    } catch (e) {
      console.error(e);
      alert("Erreur génération IA");
    }
    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="border rounded p-4 space-y-4 bg-white">

      <h3 className="text-lg font-semibold text-ratecard-blue">
        Visuel de l’article
      </h3>

      {loading && (
        <p className="text-sm text-gray-500">Traitement en cours…</p>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <label className="px-4 py-2 bg-gray-100 rounded cursor-pointer">
          Importer un visuel
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && upload(e.target.files[0], "rectangle")
            }
          />
        </label>

        <label className="px-4 py-2 bg-gray-100 rounded cursor-pointer">
          Importer version carrée
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && upload(e.target.files[0], "square")
            }
          />
        </label>

        <button
          onClick={generateAI}
          className="px-4 py-2 bg-ratecard-blue text-white rounded"
        >
          Générer via IA
        </button>

        {(squareFilename || rectFilename) && (
          <button
            onClick={resetVisual}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Supprimer le visuel
          </button>
        )}
      </div>

      {/* ETAT */}
      <div className="text-sm text-gray-600 space-y-1">
        <div>
          Carré : {squareFilename ? squareFilename : "—"}
        </div>
        <div>
          Rectangle : {rectFilename ? rectFilename : "—"}
        </div>
      </div>

    </div>
  );
}
