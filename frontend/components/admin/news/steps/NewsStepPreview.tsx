"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type NewsType = "NEWS" | "BRIEF";

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
        alert("Erreur chargement aperçu");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [newsId]);

  if (loading) return <p>Chargement…</p>;
  if (!news) return <p>Contenu introuvable</p>;

  const newsType: NewsType = news.NEWS_TYPE || "NEWS";

  /* ---------------------------------------------------------
     VISUEL — uniquement pertinent pour NEWS
  --------------------------------------------------------- */
  const visualSrc =
    newsType === "NEWS"
      ? news.MEDIA_RECTANGLE_ID
        ? `${GCS_BASE_URL}/news/${news.MEDIA_RECTANGLE_ID}`
        : news.company?.MEDIA_LOGO_RECTANGLE_ID
        ? `${GCS_BASE_URL}/companies/${news.company.MEDIA_LOGO_RECTANGLE_ID}`
        : null
      : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* LABEL TYPE */}
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {newsType === "BRIEF" ? "Brève" : "News"}
      </div>

      {/* VISUEL (NEWS UNIQUEMENT) */}
      {visualSrc && (
        <img
          src={visualSrc}
          alt={news.TITLE}
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

      {/* EXCERPT — TOUJOURS AFFICHÉ */}
      {news.EXCERPT && (
        <p className="text-base font-medium text-gray-800">
          {news.EXCERPT}
        </p>
      )}

      {/* TEXTE LONG — NEWS UNIQUEMENT */}
      {newsType === "NEWS" && news.BODY && (
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

      {/* ACTION */}
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
