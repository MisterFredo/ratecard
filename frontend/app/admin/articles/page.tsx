"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import Drawer from "@/components/ui/Drawer";
import ArticlePreview from "@/components/articles/ArticlePreview";

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewArticle, setPreviewArticle] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function load() {
    setLoading(true);
    const res = await api.get("/articles/list");
    setArticles(res.articles || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function archive(id) {
    if (!confirm("Archiver cet article ?")) return;
    await api.put(`/articles/archive/${id}`, {});
    load();
  }

  async function remove(id) {
    if (!confirm("Supprimer définitivement ?")) return;
    await api.delete(`/articles/${id}`);
    load();
  }

  async function preview(a) {
    const res = await api.get(`/articles/${a.ID_ARTICLE}`);
    setPreviewArticle(res.article);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">Articles</h1>

        <Link href="/admin/articles/create">
          <button className="bg-ratecard-green text-white px-4 py-2 rounded">
            + Créer un article
          </button>
        </Link>
      </div>

      {/* TABLE */}
      {loading ? (
        <div>Chargement…</div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left">Titre</th>
              <th className="p-2 text-left">Société</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Axes</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr key={a.ID_ARTICLE} className="border-b hover:bg-gray-50">

                <td className="p-2">{a.TITRE}</td>

                <td className="p-2">{a.COMPANY_NAME || "—"}</td>

                <td className="p-2">
                  {a.DATE_PUBLICATION
                    ? new Date(a.DATE_PUBLICATION).toLocaleDateString("fr-FR")
                    : "—"}
                </td>

                <td className="p-2 text-sm text-gray-600">
                  {a.AXES?.join(", ") || "—"}
                </td>

                <td className="p-2">
                  {a.IS_ARCHIVED ? (
                    <span className="text-xs bg-gray-300 px-2 py-1 rounded">
                      Archivé
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Actif
                    </span>
                  )}
                </td>

                <td className="p-2 space-x-2">
                  <button
                    onClick={() => preview(a)}
                    className="text-ratecard-blue underline"
                  >
                    Aperçu
                  </button>

                  <Link
                    href={`/admin/articles/edit/${a.ID_ARTICLE}`}
                    className="text-blue-600 underline"
                  >
                    Modifier
                  </Link>

                  {!a.IS_ARCHIVED && (
                    <button
                      onClick={() => archive(a.ID_ARTICLE)}
                      className="text-orange-600 underline"
                    >
                      Archiver
                    </button>
                  )}

                  <button
                    onClick={() => remove(a.ID_ARTICLE)}
                    className="text-red-600 underline"
                  >
                    Supprimer
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* DRAWER PREVIEW */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ArticlePreview article={previewArticle} />
      </Drawer>
    </div>
  );
}
