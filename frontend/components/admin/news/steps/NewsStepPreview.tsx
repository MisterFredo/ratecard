"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  newsId: string;
  onNext: () => void;
};

export default function NewsStepPreview({ newsId, onNext }: Props) {
  const [news, setNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/news/${newsId}`);
        setNews(res.news);
      } catch (e) {
        console.error(e);
        alert("Erreur chargement aperçu news");
      }
      setLoading(false);
    }

    load();
  }, [newsId]);

  if (loading) return <p>Chargement…</p>;
  if (!news) return <p>News introuvable</p>;

  return (
    <div className="space-y-6">
      {/* VISUEL */}
      {news.MEDIA_RECTANGLE_ID && (
        <img
          src={`${GCS_BASE_URL}/news/${news.MEDIA_RECTANGLE_ID}`}
          className="max-w-xl border rounded"
        />
      )}

      {/* SOCIÉTÉ */}
      {news.company && (
        <p className="text-sm text-gray-500">
          Société : <strong>{news.company.NAME}</strong>
        </p>
      )}

      {/* TITRE */}
      <h2 className="text-2xl font-semibold">
        {news.TITLE}
      </h2>

      {/* TEXTE */}
      {news.BODY && (
        <p className="whitespace-pre-line text-gray-700">
          {news.BODY}
        </p>
      )}

      {/* TOPICS */}
      {news.topics?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {news.topics.map((t: any) => (
            <span
              key={t.ID_TOPIC}
              className="px-2 py-1 bg-gray-100 rounded text-xs"
            >
              {t.LABEL}
            </span>
          ))}
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={onNext}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Continuer vers la publication
        </button>
      </div>
    </div>
  );
}
