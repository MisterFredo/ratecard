"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ArticlePreviewPage({ params }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);

  /* ---------------------------------------------------------
     LOAD ARTICLE
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await api.get(`/articles/${id}`);
    if (!res || !res.article) {
      alert("Article introuvable");
      return;
    }

    const a = res.article;

    // Reconstruction URL GCS du visuel rectangulaire
    let rectUrl = null;
    if (a.VISUEL_RECTANGLE_PATH) {
      rectUrl = `${GCS_BASE_URL}/${a.VISUEL_RECTANGLE_PATH}`;
    } else if (a.VISUEL_URL) {
      rectUrl = a.VISUEL_URL; // fallback legacy
    }

    // reconstruction square
    let squareUrl = null;
    if (a.VISUEL_SQUARE_PATH) {
      squareUrl = `${GCS_BASE_URL}/${a.VISUEL_SQUARE_PATH}`;
    } else if (a.VISUEL_SQUARE_URL) {
      squareUrl = a.VISUEL_SQUARE_URL;
    }

    setArticle({
      ...a,
      rectUrl,
      squareUrl,
    });

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (loading || !article) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-10 p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Aperçu article
        </h1>

        <Link
          href={`/admin/articles/edit/${id}`}
          className="underline text-gray-600"
        >
          ← Modifier
        </Link>
      </div>

      {/* VISUEL */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Visuel principal :</p>
        {article.rectUrl ? (
          <img
            src={article.rectUrl}
            className="w-full max-w-3xl rounded border bg-white shadow"
          />
        ) : (
          <p className="text-gray-400 italic">Aucun visuel</p>
        )}
      </div>

      {/* META */}
      <div className="bg-white border rounded p-4 space-y-2 shadow-sm">
        <h2 className="text-xl font-bold">{article.TITRE}</h2>

        {article.EXCERPT && (
          <p className="text-gray-600 italic">{article.EXCERPT}</p>
        )}

        <div className="text-sm text-gray-500">
          <div>
            <strong>Axes :</strong>{" "}
            {article.axes && article.axes.length > 0
              ? article.axes.map((a) => a.AXE_VALUE).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Sociétés :</strong>{" "}
            {article.companies && article.companies.length > 0
              ? article.companies.join(", ")
              : "—"}
          </div>

          <div>
            <strong>Personnes :</strong>{" "}
            {article.persons && article.persons.length > 0
              ? article.persons.map((p) => p.ID_PERSON).join(", ")
              : "—"}
          </div>

          <div>
            <strong>Publication :</strong>{" "}
            {article.DATE_PUBLICATION
              ? new Date(article.DATE_PUBLICATION).toLocaleString("fr-FR")
              : "—"}
          </div>
        </div>
      </div>

      {/* CONTENU HTML */}
      <div className="bg-white p-6 border rounded shadow-sm max-w-3xl">
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: article.CONTENU_HTML || "" }}
        />
      </div>

      {/* ACTIONS FUTURES */}
      <div className="bg-white border rounded p-4 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">Actions (à venir)</h3>

        <div className="flex gap-3 flex-wrap">

          <button
            disabled
            className="px-4 py-2 rounded bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Publier sur LinkedIn
          </button>

          <button
            disabled
            className="px-4 py-2 rounded bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Ajouter au carousel
          </button>

          <button
            disabled
            className="px-4 py-2 rounded bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Ajouter à la newsletter Brevo
          </button>
        </div>
      </div>
    </div>
  );
}
