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
  STATUS: string;
  PUBLISHED_AT?: string | null;
  NEWS_KIND: "NEWS" | "BRIEF";
  COMPANY_NAME: string;
};

type Stats = {
  total: number;
  published: number;
  drafts: number;
  news: number;
  breves: number;
  published_year: number;
};

/* =========================================================
   CONFIG
========================================================= */

const PAGE_SIZE = 50;

/* =========================================================
   BADGE — FORMAT
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  async function load(currentPage: number) {
    setLoading(true);

    try {
      const res = await api.get(
        `/news/admin/list?limit=${PAGE_SIZE}&offset=${
          currentPage * PAGE_SIZE
        }`
      );

      setNews(res.news || []);
      setStats(res.stats || null);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement news");
    }

    setLoading(false);
  }

  async function deleteNews(id: string) {
    if (!confirm("Supprimer définitivement ce contenu ?")) return;

    try {
      await api.delete(`/news/${id}`);
      load(page);
    } catch (e) {
      console.error(e);
      alert("Erreur suppression news");
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  const hasNext = news.length === PAGE_SIZE;

  /* =========================================================
     RENDER
  ========================================================= */

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

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Publiés" value={stats.published} green />
          <StatCard label="Drafts" value={stats.drafts} yellow />
          <StatCard label="News" value={stats.news} purple />
          <StatCard label="Brèves" value={stats.breves} blue />
          <StatCard
            label="Publiés (année)"
            value={stats.published_year}
          />
        </div>
      )}

      {loading && <div>Chargement…</div>}

      {!loading && (
        <>
          {/* TABLE */}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b text-left text-gray-700">
                <th className="p-2">Titre</th>
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
                  <td className="p-2 font-medium text-gray-900">
                    {n.TITLE}
                  </td>

                  <td className="p-2">
                    <NewsKindBadge kind={n.NEWS_KIND} />
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
                      ? new Date(n.PUBLISHED_AT).toLocaleDateString(
                          "fr-FR"
                        )
                      : "—"}
                  </td>

                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <Link
                        href={`/admin/news/edit/${n.ID_NEWS}`}
                        className="text-ratecard-blue hover:text-ratecard-blue/80"
                      >
                        <Pencil size={16} />
                      </Link>

                      {n.NEWS_KIND === "NEWS" && (
                        <Link
                          href={`/admin/news/edit/${n.ID_NEWS}?step=LINKEDIN`}
                          className="text-[#0A66C2] hover:opacity-80"
                        >
                          <Linkedin size={16} />
                        </Link>
                      )}

                      <button
                        onClick={() => deleteNews(n.ID_NEWS)}
                        className="text-red-600 hover:text-red-800"
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
                    Aucun contenu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center pt-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-4 py-2 rounded border text-sm disabled:opacity-40"
            >
              ← Page précédente
            </button>

            <div className="text-sm text-gray-500">
              Page {page + 1}
            </div>

            <button
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded border text-sm disabled:opacity-40"
            >
              Page suivante →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD COMPONENT
========================================================= */

function StatCard({
  label,
  value,
  green,
  yellow,
  purple,
  blue,
}: {
  label: string;
  value: number;
  green?: boolean;
  yellow?: boolean;
  purple?: boolean;
  blue?: boolean;
}) {
  const color =
    green
      ? "bg-green-100 text-green-700"
      : yellow
      ? "bg-yellow-100 text-yellow-700"
      : purple
      ? "bg-purple-100 text-purple-700"
      : blue
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className={`p-4 rounded-lg ${color}`}>
      <div className="text-xs uppercase opacity-70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
