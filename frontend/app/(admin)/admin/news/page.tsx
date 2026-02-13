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

type NewsStats = {
  TOTAL: number;
  TOTAL_PUBLISHED: number;
  TOTAL_DRAFT: number;
  TOTAL_NEWS: number;
  TOTAL_BRIEVES: number;
  TOTAL_PUBLISHED_THIS_YEAR: number;
};

/* ========================================================= */

const PAGE_SIZE = 50;

/* ========================================================= */

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

/* ========================================================= */

export default function NewsListPage() {
  const [news, setNews] = useState<NewsLite[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  async function load(currentPage: number) {
    setLoading(true);

    try {
      const [listRes, statsRes] = await Promise.all([
        api.get(
          `/news/admin/list?limit=${PAGE_SIZE}&offset=${
            currentPage * PAGE_SIZE
          }`
        ),
        api.get("/news/admin/stats"),
      ]);

      setNews(listRes.news || []);
      setStats(statsRes.stats || null);
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

  /* ========================================================= */

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

      {/* ================= STATS ================= */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.TOTAL} />
          <StatCard label="Publiés" value={stats.TOTAL_PUBLISHED} green />
          <StatCard label="Drafts" value={stats.TOTAL_DRAFT} yellow />
          <StatCard label="News" value={stats.TOTAL_NEWS} purple />
          <StatCard label="Brèves" value={stats.TOTAL_BRIEVES} blue />
          <StatCard
            label="Publiés (année)"
            value={stats.TOTAL_PUBLISHED_THIS_YEAR}
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
                <tr key={n.ID_NEWS} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{n.TITLE}</td>

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
                      ? new Date(n.PUBLISHED_AT).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>

                  {/* ✅ CORRECTION ICI UNIQUEMENT */}
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <Link href={`/admin/news/edit/${n.ID_NEWS}`}>
                        <Pencil size={16} />
                      </Link>

                      {n.NEWS_KIND === "NEWS" && (
                        <Link
                          href={`/admin/news/edit/${n.ID_NEWS}?step=LINKEDIN`}
                        >
                          <Linkedin size={16} />
                        </Link>
                      )}

                      <button onClick={() => deleteNews(n.ID_NEWS)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

/* ========================================================= */

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
  let bg = "bg-white";
  let text = "text-gray-800";

  if (green) {
    bg = "bg-green-50";
    text = "text-green-700";
  }
  if (yellow) {
    bg = "bg-yellow-50";
    text = "text-yellow-700";
  }
  if (purple) {
    bg = "bg-purple-50";
    text = "text-purple-700";
  }
  if (blue) {
    bg = "bg-blue-50";
    text = "text-blue-700";
  }

  return (
    <div className={`${bg} rounded-lg p-4 border`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-semibold ${text}`}>
        {value}
      </div>
    </div>
  );
}
