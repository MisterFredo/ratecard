"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  contentId: string;
  rectUrl: string | null;
  onUpdated: (url: string | null) => void;
};

export default function ContentVisualSection({
  contentId,
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
    return `${GCS_BASE_URL}/contents/${filename}`;
  }

  /* ---------------------------------------------------------
     UPLOAD (RECTANGLE UNIQUEMENT)
  --------------------------------------------------------- */
  async function upload(file: File) {
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/content/upload", {
        id_content: contentId,
        base64_image: base64,
      });

      if (res.status !== "ok") {
        throw new Error("Upload failed");
      }

      if (res.filename) {
        onUpdated(gcsUrl(res.filename));
      }
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel contenu");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */
  async function resetVisual() {
    if (!confirm("Supprimer le visuel du contenu ?")) return;

    setLoading(true);

    try {
      const res = await api.post("/visuals/content/reset", {
        id_content: contentId,
      });

      if (res.status !== "ok") {
        throw new Error("Reset failed");
      }

      onUpdated(null);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur reset visuel contenu");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-xl font-semibold">Visuel du contenu</h2>

      {loading && <p className="text-gray-500">Traitement…</p>}

      <div>
        <p className="text-sm text-gray-500 mb-1">Format rectangulaire</p>

        {rectUrl ? (
          <img
            src={rectUrl}
            className="w-full max-w-xl border rounded bg-white"
          />
        ) : (
          <div className="w-full max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-500">
            Aucun visuel
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="mt-3"
          onChange={(e) =>
            e.target.files && upload(e.target.files[0])
          }
        />
      </div>

      {rectUrl && (
        <button
          className="px-3 py-2 bg-red-600 text-white rounded text-sm"
          onClick={resetVisual}
        >
          Supprimer le visuel
        </button>
      )}
    </div>
  );
}
