"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await api.get("/articles/list");
    const rows = res.articles || [];

    // Construction URLs GCS
    const enriched = rows.map((a: any) => {
      const rectUrl = a.MEDIA_RECTANGLE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_RECTANGLE_ID}.jpg`
        : null;

      const squareUrl = a.MEDIA_SQUARE_ID
        ? `${GCS_BASE_URL}/articles/${a.MEDIA_SQUARE_ID}.jpg`
        : null;

      return { ...a, rectUrl, squareUrl };
    });

    setArticles(enriched);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Articles
        </h1>

        <Link
          href="/admin/articles/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded shadow hover:bg-green-600 transition"
        >
          + Nouveau
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY */}
      {!loading && articles.length === 0 && (
        <div className="text-gray-400 italic border p-4 rounded">
          Aucun article pour le moment.
        </div>
      )}

      {/* TABLE */}
      {!loading && articles.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-gray-600">
              <th className="p-2 w-16">Visuel</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Axes</th>
              <th className="p-2">Sociétés</th>
              <th className="p-2">Créé le</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr
                key={a.ID_ARTICLE}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* MINI VISUEL */}
                <td className="p-2">
                  {a.rectUrl ? (
                    <img
                      src={a.rectUrl}
                      className="h-12 w-auto rounded border bg-white shadow-sm"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* TITRE */}
                <td className="p-2 font-medium">{a.TITRE}</td>

                {/* AXES */}
                <td className="p-2">
                  {Array.isArray(a.AXES) && a.AXES.length > 0
                    ? a.AXES.join(", ")
                    : "—"}
                </td>

                {/* COMPANIES */}
                <td className="p-2">
                  {Array.isArray(a.COMPANIES) && a.COMPANIES.length > 0
                    ? a.COMPANIES.join(", ")
                    : "—"}
                </td>

                {/* DATE */}
                <td className="p-2">
                  {a.CREATED_AT
                    ? new Date(a.CREATED_AT).toLocaleDateString("fr-FR")
                    : ""}
                </td>

                {/* STATUS */}
                <td className="p-2">
                  {a.IS_ARCHIVED ? (
                    <span className="text-red-600">Archivé</span>
                  ) : a.IS_FEATURED ? (
                    <span className="text-green-600 font-semibold">En une</span>
                  ) : (
                    <span className="text-gray-600">Actif</span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-2 text-right">
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
      )}

    </div>
  );
}
