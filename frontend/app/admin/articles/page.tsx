"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Drawer from "@/components/ui/Drawer";
import ArticlePreview from "@/components/articles/ArticlePreview";

export default function ArticlesList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewArticle, setPreviewArticle] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ---------------------------------------------
     LOAD ARTICLES
  --------------------------------------------- */
  async function load() {
    setLoading(true);
    const res = await api.get("/articles/list");
    setArticles(res.articles || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------------------------------------
     ACTIONS
  --------------------------------------------- */
  async function archive(id: string) {
    if (!confirm("Archiver cet article ?")) return;
    await api.put(`/articles/archive/${id}`, {});
    load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cet article ?")) return;
    await api.delete(`/articles/${id}`);
    load();
  }

  async function preview(a: any) {
    const res = await api.get(`/articles/${a.ID_ARTICLE}`);
    setPreviewArticle(res.article);
    setDrawerOpen(true);
  }

  /* ---------------------------------------------
     RENDER
  --------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">Articles</h1>

        <Link href="/admin/articles/create">
          <button className="bg-ratecard-green text-white px-4 py-2 rounded shadow-md hover:bg-green-600 transition">
            + Créer un article
          </button>
        </Link>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-gray-500">Chargement…</div>
      ) : articles.length === 0 ? (
        <div className="text-gray-500 italic">
          Aucun article pour le moment.
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Titre</th>
              <th className="p-2">Société</th>
              <th className="p-2">Date</th>
              <th className="p-2">Axes</th>
              <th className="p-2">Statut</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr
                key={a.ID_ARTICLE}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* TITRE */}
                <td className="p-2 font-medium">{a.TITRE}</td>

                {/* SOCIÉTÉ */}
                <td className="p-2">
                  {a.COMPANY_NAME || "—"}
                </td>

                {/* DATE */}
                <td className="p-2">
                  {a.DATE_PUBLICATION
                    ? new Date(a.DATE_PUBLICATION).toLocaleDateString("fr-FR")
                    : "—"}
                </td>

                {/* AXES */}
                <td className="p-2 text-gray-600">
                  {Array.isArray(a.AXES) && a.AXES.length > 0
                    ? a.AXES.join(", ")
                    : "—"}
                </td>

                {/* STATUT */}
                <td className="p-2">
                  {a.IS_ARCHIVED ? (
                    <span className="text-xs bg-gray-300 text-gray-800 px-2 py-1 rounded">
                      Archivé
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Actif
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-2 flex gap-3 justify-end">

                  {/* APERÇU */}
                  <button
                    onClick={() => preview(a)}
                    className="text-ratecard-blue hover:underline"
                  >
                    Aperçu
                  </button>

                  {/* EDIT */}
                  <Link
                    href={`/admin/articles/edit/${a.ID_ARTICLE}`}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </Link>

                  {/* ARCHIVE */}
                  {!a.IS_ARCHIVED && (
                    <button
                      onClick={() => archive(a.ID_ARTICLE)}
                      className="text-orange-600 hover:underline"
                    >
                      Archiver
                    </button>
                  )}

                  {/* DELETE */}
                  <button
                    onClick={() => remove(a.ID_ARTICLE)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PREVIEW DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Aperçu article" size="xl">
        {previewArticle ? (
          <ArticlePreview article={previewArticle} />
        ) : (
          <div className="text-gray-500">Chargement…</div>
        )}
      </Drawer>
    </div>
  );
}

