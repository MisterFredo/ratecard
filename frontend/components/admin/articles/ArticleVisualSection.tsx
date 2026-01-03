"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  articleId: string;
  squareUrl: string | null;
  rectUrl: string | null;
  onUpdated: (urls: { square: string | null; rectangle: string | null }) => void;
};

export default function ArticleVisualSection({
  articleId,
  squareUrl,
  rectUrl,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     UTILS
  --------------------------------------------------------- */
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result?.toString() || "";
        resolve(result.replace(/^data:image\/\w+;base64,/, ""));
      };
      reader.readAsDataURL(file);
    });
  }

  function gcsUrl(filename: string) {
    return `${GCS_BASE_URL}/articles/${filename}`;
  }

  /* ---------------------------------------------------------
     UPLOAD
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

      if (res.status !== "ok") {
        throw new Error("Upload failed");
      }

      onUpdated({
        square: format === "square" ? "updated" : squareUrl,
        rectangle: format === "rectangle" ? "updated" : rectUrl,
      });
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel article");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */
  async function resetVisuals() {
    if (!confirm("Supprimer les visuels de l’article ?")) return;

    setLoading(true);

    try {
      const res = await api.post("/visuals/article/reset", {
        id_article: articleId,
      });

      if (res.status !== "ok") {
        throw new Error("Reset failed");
      }

      onUpdated({ square: null, rectangle: null });
    } catch (e) {
      console.error(e);
      alert("❌ Erreur reset visuels article");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold">Visuels de l’article</h2>

      {loading && <p className="text-gray-500">Traitement…</p>}

      <div className="flex gap-6">
        {/* SQUARE */}
        <div>
          <p className="text-sm text-gray-500">Carré</p>
          {squareUrl ? (
            <img
              src={squareUrl}
              className="w-24 h-24 border rounded object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) =>
              e.target.files && upload(e.target.files[0], "square")
            }
          />
        </div>

        {/* RECTANGLE */}
        <div>
          <p className="text-sm text-gray-500">Rectangle</p>
          {rectUrl ? (
            <img src={rectUrl} className="w-48 border rounded" />
          ) : (
            <div className="w-48 h-24 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
              Aucun
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={(e) =>
              e.target.files && upload(e.target.files[0], "rectangle")
            }
          />
        </div>
      </div>

      <button
        className="px-3 py-2 bg-red-600 text-white rounded text-sm"
        onClick={resetVisuals}
      >
        Réinitialiser les visuels
      </button>
    </div>
  );
}
