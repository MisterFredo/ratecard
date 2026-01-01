"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
// ex: https://storage.googleapis.com/ratecard-media

type ArticleLite = {
  ID_ARTICLE: string;
  TITRE: string;
  RESUME?: string;
  CREATED_AT?: string;
  IS_FEATURED?: boolean;
  FEATURED_ORDER?: number | null;
  IS_ARCHIVED?: boolean;

  MEDIA_RECTANGLE_ID?: string | null;
  MEDIA_SQUARE_ID?: string | null;
};

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<ArticleLite[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await api.get("/articles/list");
    const raw = res.articles || [];

    // Récupération des visuels GCS (rectangle prioritaire)
    const enriched = await Promise.all(
      raw.map(async (a: ArticleLite) => {
        let rectangleUrl: string | null = null;
        let squareUrl: string | null = null;

        // rectangle
        if (a.MEDIA_RECTANGLE_ID) {
          const r = await api.get(
            `/media/by-entity?type=article&id=${a.ID_ARTICLE}`
          );
          const media = r.media || [];
          const rect = media.find((m: any) => m.FORMAT === "rectangle");
          if (rect && rect.FILEPATH) rectangleUrl = `${GCS}/${rect.FILEPATH}`;
        }

        // carré
        if (a.MEDIA_SQUARE_ID) {
          const r = await api.get(
            `/media/by-entity?type=article&id=${a.ID_ARTICLE}`
          );
          const media = r.media || [];
          const sq = media.find((m: any) => m.FORMAT === "square");
          if (sq && sq.FILEPATH) squareUrl = `${GCS}/${sq.FILEPATH}`;
        }

        return {
          ...a,
          rectangleUrl,
          squareUrl,
        };
      })
    );

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
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          + Nouvel article
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY */}
      {!loading && articles.length === 0 && (
        <div className="border p-6 rounded text-gray-500 italic">
          Aucun article enregistré.
        </div>
      )}

      {/* TABLE */}
      {!loading && articles.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-gray-700">
              <th className="p-2">Visuel</th>
              <th className="p-2">Titre</th>
              <th className="p-2">Résumé</th>
              <th className="p-2">Créé le</th>
              <th className="p-2">Featured</th>
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
                  {a.rectangleUrl || a.squareUrl ? (
                    <img
                      src={a.rectangleUrl || a.squareUrl!}
                      className="h-12 w-auto rounded border shadow-sm bg-white object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* TITRE */}
                <td className="p-2 font-medium">{a.TITRE}</td>

                {/* RESUME */}
                <td className="p-2 text-gray-700 max-w-[250px] truncate">
                  {a.RESUME || "—"}
                </td>

                {/* CREATED DATE */}
                <td className="p-2 text-gray-600">
                  {a.CREATED_AT
                    ? new Date(a.CREATED_AT).toLocaleDateString("fr-FR")
                    : "—"}
                </td>

                {/* FEATURED */}
                <td className="p-2">
                  {a.IS_FEATURED ? (
                    <span className="text-green-600 font-semibold">
                      ✓ {a.FEATURED_ORDER || ""}
                    </span>
                  ) : (
                    "—"
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
