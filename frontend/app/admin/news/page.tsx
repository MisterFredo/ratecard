"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type NewsLite = {
  ID_NEWS: string;
  TITLE: string;
  STATUS: string;
  PUBLISHED_AT?: string | null;
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

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          News
        </h1>

        <Link
          href="/admin/news/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouvelle news
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
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
              <td className="p-2 font-medium">
                {n.TITLE}
              </td>

              <td className="p-2 text-gray-600">
                {n.COMPANY_NAME}
              </td>

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

              <td className="p-2">
                {n.PUBLISHED_AT
                  ? new Date(n.PUBLISHED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              <td className="p-2 text-right">
                <Link
                  href={`/admin/news/edit/${n.ID_NEWS}`}
                  className="inline-flex items-center gap-1 text-ratecard-blue hover:text-ratecard-blue/80"
                  title="Modifier la news"
                >
                  <Pencil size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
