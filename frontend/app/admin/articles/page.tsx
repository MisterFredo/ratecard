"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

// ------------------------------------------------------------------
// TYPE LOCAL POUR LA LISTE
// (on étend ArticleLite avec les URLs visuelles reconstruites)
// ------------------------------------------------------------------
type ArticleLite = {
  ID_ARTICLE: string;
  TITRE: string;
  RESUME: string | null;
  CREATED_AT: string | null;
  IS_FEATURED: boolean;
  FEATURED_ORDER: number | null;
  IS_ARCHIVED: boolean;
  MEDIA_RECTANGLE_ID?: string | null;
  MEDIA_SQUARE_ID?: string | null;

  // 🔥 Champs dérivés — ajoutés ensuite côté front
  rectUrl?: string | null;
  squareUrl?: string | null;
};

export default function ArticleListPage() {
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD ARTICLES
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await api.get("/articles/list");
    const list: ArticleLite[] = res.articles || [];

    // 🔥 Construire dynamiquement les URLs GCS
    const enriched = list.map((a) => {
      const rectUrl = a.MEDIA_RECTANGLE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_RECTANGLE_ID}.jpg`
        : null;

      const squareUrl = a.MEDIA_SQUARE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_SQUARE_ID}.jpg`
        : null;

      return {
        ...a,
        rectUrl,
        squareUrl,
      };
    });

    setArticles(enriched);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Articles
        </h1>

        <Link
          href="/admin/articles/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouvel article
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Visuel</th>
            <th className="p-2">Titre</th>
            <th className="p-2">Résumé</th>
            <th className="p-2">Créé le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((a) => (
            <tr
              key={a.ID_ARTICLE}
              className="border-b hover:bg-gray-50 transition"
            >
              {/* VISUEL */}
              <td className="p-2">
                {a.rectUrl ? (
                  <img
                    src={a.rectUrl}
                    className="h-12 w-auto rounded border shadow-sm bg-white object-contain"
                  />
                ) : a.squareUrl ? (
                  <img
                    src={a.squareUrl}
                    className="h-12 w-12 rounded border shadow-sm bg-white object-cover"
                  />
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </td>

              {/* TITRE */}
              <td className="p-2 font-medium">{a.TITRE}</td>

              {/* RESUME */}
              <td className="p-2 text-gray-600">
                {a.RESUME || "—"}
              </td>

              {/* DATE */}
              <td className="p-2">
                {a.CREATED_AT
                  ? new Date(a.CREATED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right space-x-2">
                <Link
                  href={`/admin/articles/preview/${a.ID_ARTICLE}`}
                  className="text-blue-600 hover:underline"
                >
                  Voir
                </Link>

                <Link
                  href={`/admin/articles/edit/${a.ID_ARTICLE}`}
                  className="text-ratecard-blue hover:underline"
                >
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
