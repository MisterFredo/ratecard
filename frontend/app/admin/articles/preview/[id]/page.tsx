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

    // -------------------------------------------------------
    // VISUEL : reconstruction GCS
    // -------------------------------------------------------
    let rectUrl = null;
    if (a.media_rectangle_path) {
      rectUrl = `${GCS_BASE_URL}/${a.media_rectangle_path}`;
    }

    let squareUrl = null;
    if (a.media_square_path) {
      squareUrl = `${GCS_BASE_URL}/${a.media_square_path}`;
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
          Aperçu de l’article
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

        <h2 className="text-xl font-bold">{article.TITRE}</h2>

        {article.RESUME && (
          <p className="text-gray-600 italic">{article.RESUME}</p>
        )}

        <div className="text-sm text-gray-600 space-y-1">

          {/* AXES */}
          <div>
            <strong>Axes :</strong>{" "}
            {article.axes && article.axes.length > 0
              ? article.axes.map((ax) => ax.LABEL).join(", ")
              : "—"}
          </div>

          {/* COMPANIES */}
          <div>
            <strong>Sociétés :</strong>{" "}
            {article.companies && article.companies.length > 0
              ? article.companies.map((c) => c.NAME).join(", ")
              : "—"}
          </div>

          {/* PERSONS */}
          <div>
            <strong>Personnes :</strong>{" "}
            {article.persons && article.persons.length > 0
              ? article.persons
                  .map((p) => `${p.NAME}${p.ROLE ? " (" + p.ROLE + ")" : ""}`)
                  .join(", ")
              : "—"}
          </div>

          {/* PUBLICATION */}
          <div>
            <strong>Créé le :</strong>{" "}
            {article.CREATED_AT
              ? new Date(article.CREATED_AT).toLocaleString("fr-FR")
              : "—"}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-6 border rounded shadow-sm max-w-3xl">
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: article.CONTENU_HTML || "" }}
        />
      </div>

      {/* ACTIONS FUTURES */}
      <div className="bg-white border rounded p-4 shadow-sm space-y-4 max-w-3xl">
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
