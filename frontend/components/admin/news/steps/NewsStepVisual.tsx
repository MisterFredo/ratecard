"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  newsId: string;
  mediaId: string | null;
  onUpdated: (mediaId: string) => void;
  onNext: () => void;
};

export default function NewsStepVisual({
  newsId,
  mediaId,
  onUpdated,
  onNext,
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
     UPLOAD
  --------------------------------------------------------- */
  async function upload(file: File) {
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/content/upload", {
        id_content: newsId,
        base64_image: base64,
      });

      if (res.status !== "ok" || !res.filename) {
        throw new Error("Upload échoué");
      }

      onUpdated(res.filename);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Un visuel est <strong>obligatoire</strong> pour publier une News.
      </p>

      {loading && <p className="text-gray-500">Traitement…</p>}

      {mediaId ? (
        <img
          src={gcsUrl(mediaId)}
          className="max-w-xl border rounded bg-white"
        />
      ) : (
        <div className="max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-500">
          Aucun visuel
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files && upload(e.target.files[0])
        }
      />

      <div className="pt-4">
        <button
          onClick={onNext}
          disabled={!mediaId}
          className="bg-ratecard-blue text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
