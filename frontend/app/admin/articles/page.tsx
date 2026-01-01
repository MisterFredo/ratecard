"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

/**
 * Page d’administration — Liste des Articles
 */
export default function ArticleListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD ARTICLES
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    const res = await api.get("/articles/list");
    const raw = res.articles || [];

    // Reconstruction visuels GCS
    const enriched = raw.map((a: any) => {
      const rectUrl =
        a.MEDIA_RECTANGLE_ID && a.VISUEL_RECTANGLE_PATH
          ? `${GCS_BASE_URL}/${a.VISUEL_RECTANGLE_PATH}`
          : a.VISUEL_URL || null;

      return {
        ...a,
        rectUrl,
      };
    });

    setArticles(enriched);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Articles
        </h1>

        <Link
          href="/admin/articles/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          + Ajouter un article
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-500">Chargement…</p>}

      {/* EMPTY */}
      {!loading && articles.length === 0 && (
        <p className="text-gray-500 italic">
          Aucun article pour le moment.
        </p>
      )}

      {/* TABLE */}
      {!loading && articles.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-gray-700">
              <th className="p-2">Visuel</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Axes</th>
              <th className="p-2">Sociétés</th>
              <th className="p-2">Publication</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr key={a.ID_ARTICLE} className="border-b hover:bg-gray-50">

                {/* VISUEL */}
                <td className="p-2">
                  {a.rectUrl ? (
                    <img
                      src={a.rectUrl}
                      className="h-12 w-auto rounded border bg-white object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* TITRE */}
                <td className="p-2 font-medium">{a.TITRE}</td>

                {/* AXES */}
                <td className="p-2">
                  {a.axes && a.axes.length > 0
                    ? a.axes.join(", ")
                    : "—"}
                </td>

                {/* SOCIETES */}
                <td className="p-2">
                  {a.companies && a.companies.length > 0
                    ? a.companies
                    : "—"}
                </td>

                {/* DATE */}
                <td className="p-2 text-gray-600">
                  {a.DATE_PUBLICATION
                    ? new Date(a.DATE_PUBLICATION).toLocaleDateString("fr-FR")
                    : "—"}
                </td>

                {/* ACTIONS */}
                <td className="p-2 text-right">
                  <Link
                    href={`/admin/articles/edit/${a.ID_ARTICLE}`}
                    className="text-ratecard-blue hover:underline mr-4"
                  >
                    Modifier
                  </Link>

                  <Link
                    href={`/admin/articles/preview/${a.ID_ARTICLE}`}
                    className="text-gray-600 hover:underline"
                  >
                    Aperçu
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
