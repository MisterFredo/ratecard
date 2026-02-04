"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  newsId: string;

  mediaId: string | null;              // VISUEL NEWS
  companyMediaId?: string | null;       // FALLBACK SOCIÉTÉ

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

      onUpdated(res.filename);
    } catch (e) {
      console.error(e);
      alert("❌ Erreur upload visuel");
    }

    setLoading(false);
  }

  const visualSrc = mediaId
    ? `${GCS_BASE_URL}/news/${mediaId}`
    : companyMediaId
    ? `${GCS_BASE_URL}/companies/${companyMediaId}`
    : null;

  const isCompanyFallback = !mediaId && !!companyMediaId;

  const imageClass = isCompanyFallback
    ? "absolute inset-0 w-full h-full object-contain p-8"
    : "absolute inset-0 w-full h-full object-cover";

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Vous pouvez utiliser un visuel spécifique à la news.
        <br />
        À défaut, le visuel de la société sera utilisé automatiquement.
      </p>

      {loading && <p className="text-gray-500">Traitement…</p>}

      {visualSrc ? (
        <div className="max-w-xl relative aspect-[16/9] overflow-hidden bg-ratecard-light border rounded">
          <img src={visualSrc} alt="Visuel news" className={imageClass} />

          {isCompanyFallback && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              Visuel société (fallback)
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center text-sm text-gray-500">
          Aucun visuel disponible
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
