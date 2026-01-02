"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type ArticleLite = {
  ID_ARTICLE: string;
  TITLE: string;
  EXCERPT?: string | null;
  STATUS: string;
  CREATED_AT?: string | null;
  MEDIA_RECTANGLE_ID?: string | null;
  MEDIA_SQUARE_ID?: string | null;
};

export default function ArticleListPage() {
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD ARTICLES
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/articles/list");
      const list: ArticleLite[] = res.articles || [];

      const enriched = list.map((a) => {
        const rectUrl = a.MEDIA_RECTANGLE_ID
          ? `${GCS_BASE_URL}/articles/${a.MEDIA_RECTANGLE_ID}`
          : null;

        const squareUrl = a.MEDIA_SQUARE_ID
          ? `${GCS_BASE_URL}/articles/${a.MEDIA_SQUARE_ID}`
          : null;

        return {
          ...a,
          rectUrl,
          squareUrl,
        };
      });

      setArticles(enriched);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement articles");
    }

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
            <th className="p-2">Statut</th>
            <th className="p-2">Créé le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((a: any) => (
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
              <td className="p-2 font-medium">{a.TITLE}</td>

              {/* RESUME */}
              <td className="p-2 text-gray-600">
                {a.EXCERPT || "—"}
              </td>

              {/* STATUS */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    a.STATUS === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : a.STATUS === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {a.STATUS}
                </span>
              </td>

              {/* DATE */}
              <td className="p-2">
                {a.CREATED_AT
                  ? new Date(a.CREATED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right space-x-3">
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
