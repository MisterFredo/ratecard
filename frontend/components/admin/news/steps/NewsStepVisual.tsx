"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  newsId: string;

  // visuel spécifique à la news (rectangle)
  mediaId: string | null;

  // visuel rectangle hérité de la société UNIQUEMENT
  companyMediaId?: string | null;

  onUpdated: (mediaId: string) => void;
  onNext: () => void;
};

export default function NewsStepVisual({
  newsId,
  mediaId,
  companyMediaId,
  onUpdated,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);

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

  function gcsNewsUrl(filename: string) {
    return `${GCS_BASE_URL}/news/${filename}`;
  }

  function gcsCompanyRectUrl(filename: string) {
    return `${GCS_BASE_URL}/companies/${filename}`;
  }

  async function upload(file: File) {
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      const res = await api.post("/visuals/news/upload", {
        id_news: newsId,
        base64_image: base64,
      });

      if (res.status !== "ok" || !res.filename) {
        throw new Error("Upload échoué");
      }

      // 👉 visuel news (rectangle) devient prioritaire
      onUpdated(res.filename);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel");
    }

    setLoading(false);
  }

  // ---------------------------------------------------------
  // LOGIQUE VISUEL — RECTANGLE UNIQUEMENT
  // ---------------------------------------------------------
  const visualSrc = mediaId
    ? gcsNewsUrl(mediaId)
    : companyMediaId
    ? gcsCompanyRectUrl(companyMediaId)
    : null;

  const isInherited = !mediaId && !!companyMediaId;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Un visuel <strong>16:9</strong> est requis pour publier la news.
        <br />
        Seuls les visuels rectangulaires sont acceptés.
      </p>

      {loading && <p className="text-gray-500">Traitement…</p>}

      {visualSrc ? (
        <div className="space-y-2">
          <img
            src={visualSrc}
            className="max-w-xl border rounded bg-white"
          />

          {isInherited && (
            <p className="text-xs text-gray-500">
              Visuel rectangulaire hérité de la société
            </p>
          )}
        </div>
      ) : (
        <div className="max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-500">
          Aucun visuel rectangulaire disponible
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
          disabled={!visualSrc}
          className="bg-ratecard-blue text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
