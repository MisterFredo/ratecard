"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Props = {
  articleId: string;
  onBack: () => void;
  onNext: () => void;
};

export default function StepPreview({
  articleId,
  onBack,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get(`/articles/${articleId}`);
      const a = res.article;

      const rectUrl = a.MEDIA_RECTANGLE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_RECTANGLE_ID}`
        : null;

      const squareUrl = a.MEDIA_SQUARE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_SQUARE_ID}`
        : null;

      setArticle({
        ...a,
        rectUrl,
        squareUrl,
      });
    } catch (e) {
      console.error(e);
      alert("Article introuvable");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [articleId]);

  if (loading || !article) {
    return <div>Chargement de l’aperçu…</div>;
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-ratecard-blue">
          Aperçu de l’article
        </h2>

        <button
          onClick={onBack}
          className="underline text-gray-600"
        >
          ← Modifier
        </button>
      </div>

      {/* VISUEL */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Visuel principal</p>

        {article.rectUrl ? (
          <img
            src={article.rectUrl}
            className="w-full max-w-3xl rounded border bg-white shadow"
          />
        ) : article.squareUrl ? (
          <img
            src={article.squareUrl}
            className="w-64 rounded border bg-white shadow"
          />
        ) : (
          <p className="text-gray-400 italic">Aucun visuel</p>
        )}
      </div>

      {/* META */}
      <div className="bg-white border rounded p-4 space-y-3 shadow-sm max-w-3xl">
        <h3 className="text-xl font-bold">{article.TITLE}</h3>

        {article.EXCERPT && (
          <p className="text-gray-600 italic">
            {article.EXCERPT}
          </p>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <div>
            <strong>Topics :</strong>{" "}
            {article.topics?.length
              ? article.topics.map((t: any) => t.LABEL).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Sociétés :</strong>{" "}
            {article.companies?.length
              ? article.companies.map((c: any) => c.NAME).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Personnes :</strong>{" "}
            {article.persons?.length
              ? article.persons
                  .map((p: any) =>
                    `${p.NAME}${p.ROLE ? " (" + p.ROLE + ")" : ""}`
                  )
                  .join(", ")
              : "—"}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-6 border rounded shadow-sm max-w-3xl">
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{
            __html: article.CONTENT_HTML || "",
          }}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded"
        >
          Retour à l’édition
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-ratecard-blue text-white rounded"
        >
          Continuer vers publication
        </button>
      </div>
    </div>
  );
}
