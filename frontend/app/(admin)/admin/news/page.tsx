"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2, Linkedin } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type NewsLite = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;
  STATUS: string;
  PUBLISHED_AT?: string | null;

  // ✅ STRUCTURE (FORMAT)
  NEWS_KIND: "NEWS" | "BRIEF";

  ID_COMPANY: string;
  COMPANY_NAME: string;
};

/* =========================================================
   BADGE — FORMAT (NEWS / BRÈVE)
========================================================= */

function NewsKindBadge({ kind }: { kind: "NEWS" | "BRIEF" }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        kind === "BRIEF"
          ? "bg-blue-100 text-blue-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      {kind === "BRIEF" ? "Brève" : "News"}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function NewsListPage() {
  const [news, setNews] = useState<NewsLite[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/news/list");
      setNews(res.news || []);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement news");
    }
    setLoading(false);
  }

  async function deleteNews(id: string) {
    const confirmed = confirm(
      "Supprimer définitivement ce contenu ?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/news/${id}`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Erreur suppression news");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          News & brèves
        </h1>

        <Link
          href="/admin/news/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouveau contenu
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Contenu</th>
            <th className="p-2">Format</th>
            <th className="p-2">Société</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Publié le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {news.map((n) => (
            <tr
              key={n.ID_NEWS}
              className={`border-b transition ${
                n.NEWS_KIND === "BRIEF"
                  ? "bg-blue-50/40 hover:bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              {/* TITRE + EXCERPT */}
              <td className="p-2">
                <div
                  className={`font-medium ${
                    n.NEWS_KIND === "BRIEF"
                      ? "text-blue-900"
                      : "text-gray-900"
                  }`}
                >
                  {n.TITLE}
                </div>

                {n.NEWS_KIND === "NEWS" && n.EXCERPT && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {n.EXCERPT}
                  </div>
                )}
              </td>

              {/* FORMAT */}
              <td className="p-2">
                <NewsKindBadge kind={n.NEWS_KIND} />
              </td>

              {/* SOCIÉTÉ */}
              <td className="p-2 text-gray-600">
                {n.COMPANY_NAME}
              </td>

              {/* STATUT */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    n.STATUS === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : n.STATUS === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {n.STATUS}
                </span>
              </td>

              {/* DATE */}
              <td className="p-2">
                {n.PUBLISHED_AT
                  ? new Date(n.PUBLISHED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right">
                <div className="inline-flex items-center gap-3">
                  <Link
                    href={`/admin/news/edit/${n.ID_NEWS}`}
                    className="text-ratecard-blue hover:text-ratecard-blue/80"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </Link>

                  {n.NEWS_KIND === "NEWS" && (
                    <Link
                      href={`/admin/news/edit/${n.ID_NEWS}?step=LINKEDIN`}
                      className="text-[#0A66C2] hover:opacity-80"
                      title="Post LinkedIn"
                    >
                      <Linkedin size={16} />
                    </Link>
                  )}

                  <button
                    onClick={() => deleteNews(n.ID_NEWS)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {news.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="p-4 text-center text-gray-500"
              >
                Aucun contenu pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
