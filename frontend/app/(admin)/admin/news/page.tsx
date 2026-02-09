"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2, Linkedin } from "lucide-react";

type NewsLite = {
  ID_NEWS: string;
  TITLE: string;
  EXCERPT?: string | null;

  // 🧭 STRUCTURE
  NEWS_TYPE: "NEWS" | "BRIEF";

  STATUS: string;
  PUBLISHED_AT?: string | null;

  ID_COMPANY: string;
  COMPANY_NAME: string;
};

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
      "Supprimer définitivement cette news ?"
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
          News & Brèves
        </h1>

        <Link
          href="/admin/news/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouvelle publication
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Type</th>
            <th className="p-2">Titre</th>
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
              className="border-b hover:bg-gray-50 transition"
            >
              {/* TYPE : NEWS / BRIEF */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    n.NEWS_TYPE === "BRIEF"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {n.NEWS_TYPE === "BRIEF" ? "Brève" : "News"}
                </span>
              </td>

              {/* TITRE */}
              <td className="p-2 font-medium">
                {n.TITLE}
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

              {/* DATE DE PUBLICATION */}
              <td className="p-2">
                {n.PUBLISHED_AT
                  ? new Date(n.PUBLISHED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right">
                <div className="inline-flex items-center gap-3">
                  {/* EDIT */}
                  <Link
                    href={`/admin/news/edit/${n.ID_NEWS}`}
                    className="text-ratecard-blue hover:text-ratecard-blue/80"
                    title="Modifier"
                  >
                    <Pencil size={16} />
                  </Link>

                  {/* LINKEDIN */}
                  <Link
                    href={`/admin/news/edit/${n.ID_NEWS}?step=LINKEDIN`}
                    className="text-[#0A66C2] hover:opacity-80"
                    title="Post LinkedIn"
                  >
                    <Linkedin size={16} />
                  </Link>

                  {/* DELETE */}
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
                Aucune publication pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
