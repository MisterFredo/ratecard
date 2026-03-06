"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  newsId: string;
  mediaId: string | null;
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

  async function duplicateCompanyVisual() {
    if (!companyMediaId) return;

    setLoading(true);

    try {
      const res = await api.post("/news/visual/duplicate-company", {
        id_news: newsId,
        company_media_id: companyMediaId,
      });

      if (res.status !== "ok" || !res.filename) {
        throw new Error("Duplication échouée");
      }

      onUpdated(res.filename);
      onNext();
    } catch (e) {
      console.error(e);
      alert("Erreur duplication visuel société");
    }

    setLoading(false);
  }

  async function upload(file: File) {
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64 = reader.result
          ?.toString()
          .replace(/^data:image\/\w+;base64,/, "");

        const res = await api.post("/visuals/news/upload", {
          id_news: newsId,
          base64_image: base64,
        });

        if (res.status !== "ok" || !res.filename) {
          throw new Error("Upload échoué");
        }

        onUpdated(res.filename);
      };
    } catch (e) {
      console.error(e);
      alert("Erreur upload visuel");
    }

    setLoading(false);
  }

  // 🔴 LOGIQUE EXACTE QUI MARCHAIT
  const visualSrc = mediaId
    ? `${GCS_BASE_URL}/news/${mediaId}`
    : companyMediaId
    ? `${GCS_BASE_URL}/companies/${companyMediaId}`
    : null;

  const isCompanyFallback = !mediaId && !!companyMediaId;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Vous pouvez utiliser un visuel spécifique à la news.
        <br />
        À défaut, le visuel de la société sera utilisé.
      </p>

      {loading && <p>Traitement…</p>}

      {visualSrc ? (
        <div className="max-w-xl relative aspect-[16/9] overflow-hidden bg-gray-100 border rounded">
          <img
            src={visualSrc}
            alt="Visuel news"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {isCompanyFallback && (
            <div className="absolute bottom-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">
              Visuel société (à confirmer)
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl h-40 bg-gray-100 border rounded flex items-center justify-center">
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

      <div className="pt-4 flex gap-3">
        {isCompanyFallback && (
          <button
            onClick={duplicateCompanyVisual}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Utiliser le visuel société
          </button>
        )}

        <button
          onClick={async () => {
            if (isCompanyFallback) {
              await duplicateCompanyVisual();
            } else {
              onNext();
            }
          }}
          disabled={!visualSrc}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
