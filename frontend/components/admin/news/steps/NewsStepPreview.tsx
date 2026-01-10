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
    <div className="space-y-6 max-w-2xl">
      {/* VISUEL */}
      {news.MEDIA_RECTANGLE_ID && (
        <img
          src={`${GCS_BASE_URL}/news/${news.MEDIA_RECTANGLE_ID}`}
          className="w-full max-h-[260px] object-cover border rounded"
        />
      )}

      {/* SOCIÉTÉ */}
      {news.company && (
        <p className="text-sm text-gray-500">
          Société : <strong>{news.company.NAME}</strong>
        </p>
      )}

      {/* TITRE */}
      <h2 className="text-2xl font-semibold text-gray-900">
        {news.TITLE}
      </h2>

      {/* EXCERPT */}
      {news.EXCERPT && (
        <p className="text-base font-medium text-gray-800">
          {news.EXCERPT}
        </p>
      )}

      {/* TEXTE — HTML PREVIEW */}
      {news.BODY && (
        <div
          className="
            prose prose-sm max-w-none
            prose-p:my-4
            prose-ul:my-4
            prose-ol:my-4
            prose-li:my-1
            prose-strong:font-semibold
            prose-a:text-ratecard-blue
            prose-a:no-underline
            hover:prose-a:underline
          "
          dangerouslySetInnerHTML={{
            __html: news.BODY,
          }}
        />
      )}

      {/* TOPICS */}
      {news.topics?.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-2">
          {news.topics.map((t: any) => (
            <span
              key={t.ID_TOPIC}
              className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
            >
              {t.LABEL}
            </span>
          ))}
        </div>
      )}

      <div className="pt-6">
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
