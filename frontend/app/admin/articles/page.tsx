// frontend/app/admin/articles/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ArticlesList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 📌 Load articles on mount
  // ============================================================
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get("/articles/list");
      setArticles(res.articles || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">

      {/* TITLE + CTA */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Articles</h1>

        <Link
          href="/admin/articles/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Créer un article
        </Link>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-gray-500">Chargement des articles…</div>
      )}

      {/* EMPTY STATE */}
      {!loading && articles.length === 0 && (
        <div className="border border-gray-200 p-6 rounded text-gray-500">
          Aucun article pour le moment.
        </div>
      )}

      {/* TABLE LIST */}
      {!loading && articles.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 text-left">Titre</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr key={a.ID_ARTICLE} className="border-b hover:bg-gray-100">
                <td className="p-2">{a.TITRE}</td>
                <td className="p-2">
                  {a.DATE_PUBLICATION
                    ? new Date(a.DATE_PUBLICATION).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="p-2">
                  <Link
                    href={`/admin/articles/edit/${a.ID_ARTICLE}`}
                    className="text-blue-600 underline"
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

