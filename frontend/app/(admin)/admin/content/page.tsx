"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 20;

type ContentLite = {
  id_content: string;
  title: string;
  status: string;
  published_at?: string | null;
  source_date?: string | null;
  topics?: { label: string }[];
  concept?: string | null;
};

type ContentStats = {
  total: number;
  total_published: number;
  total_draft: number;
  total_ready: number;
  total_published_this_year: number;
  total_published_this_month: number;
};

export default function ContentListPage() {
  const [contents, setContents] = useState<ContentLite[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [sortBySourceDate, setSortBySourceDate] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const [listRes, statsRes] = await Promise.all([
        api.get("/content/list"),
        api.get("/content/admin/stats"),
      ]);

      setContents(listRes.contents || []);
      setStats(statsRes.stats || null);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement contenus");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleSelection(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  async function handleReady(id: string) {
    await api.post(`/content/ready/${id}`, {});
    await load();
  }

  async function handlePublish(id: string) {
    await api.post(`/content/publish/${id}`, {});
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer définitivement ce contenu ?")) return;

    try {
      setDeletingId(id);
      await api.delete(`/content/delete/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  async function bulkReady() {
    await api.post("/content/bulk/ready", { ids: selectedIds });
    setSelectedIds([]);
    await load();
  }

  async function bulkPublish() {
    await api.post("/content/bulk/publish", { ids: selectedIds });
    setSelectedIds([]);
    await load();
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  function isScheduled(c: ContentLite) {
    if (!c.published_at) return false;
    return new Date(c.published_at) > new Date();
  }

  function getStatusLabel(c: ContentLite) {
    if (c.status === "DRAFT") return "DRAFT";
    if (c.status === "READY") return "READY";
    if (isScheduled(c)) return "SCHEDULED";
    return "PUBLISHED";
  }

  function getStatusClasses(status: string) {
    if (status === "PUBLISHED")
      return "bg-green-100 text-green-700";
    if (status === "READY")
      return "bg-blue-100 text-blue-700";
    if (status === "DRAFT")
      return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  }

  // 🔵 FILTRAGE
  const filteredContents = useMemo(() => {
    if (statusFilter === "ALL") return contents;
    return contents.filter(c => getStatusLabel(c) === statusFilter);
  }, [contents, statusFilter]);

  // 🟣 TRI
  const sortedContents = useMemo(() => {
    const arr = [...filteredContents];

    if (sortBySourceDate) {
      arr.sort((a, b) => {
        const dateA = new Date(a.source_date || 0).getTime();
        const dateB = new Date(b.source_date || 0).getTime();
        return dateB - dateA;
      });
    }

    return arr;
  }, [filteredContents, sortBySourceDate]);

  // 🟢 PAGINATION
  const totalPages = Math.ceil(sortedContents.length / PAGE_SIZE);
  const paginatedContents = sortedContents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Contenus
        </h1>

        <Link
          href="/admin/content/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouveau contenu
        </Link>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Drafts" value={stats.total_draft} yellow />
          <StatCard label="Ready" value={stats.total_ready} blue />
          <StatCard label="Publiés" value={stats.total_published} green />
          <StatCard
            label="Publiés (année)"
            value={stats.total_published_this_year}
          />
          <StatCard
            label="Ce mois-ci"
            value={stats.total_published_this_month}
          />
        </div>
      )}

      {/* FILTRE + TRI */}
      <div className="flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="ALL">Tous</option>
          <option value="DRAFT">Draft</option>
          <option value="READY">Ready</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>

        <button
          onClick={() => setSortBySourceDate(!sortBySourceDate)}
          className="text-sm text-gray-600"
        >
          Trier par SOURCE_DATE {sortBySourceDate ? "✓" : ""}
        </button>
      </div>

      {/* BULK ACTIONS */}
      {selectedIds.length > 0 && (
        <div className="flex gap-4">
          <button
            onClick={bulkReady}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            READY sélection ({selectedIds.length})
          </button>

          <button
            onClick={bulkPublish}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            PUBLISH sélection ({selectedIds.length})
          </button>
        </div>
      )}

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">
              <input
                type="checkbox"
                checked={
                  selectedIds.length === paginatedContents.length &&
                  paginatedContents.length > 0
                }
                onChange={(e) =>
                  e.target.checked
                    ? setSelectedIds(paginatedContents.map(c => c.id_content))
                    : setSelectedIds([])
                }
              />
            </th>
            <th className="p-2">Titre</th>
            <th className="p-2">Topic</th>
            <th className="p-2">Statut</th>
            <th className="p-2">SOURCE_DATE</th>
            <th className="p-2">Publication</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedContents.map((c) => {
            const status = getStatusLabel(c);

            return (
              <tr key={c.id_content} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id_content)}
                    onChange={() => toggleSelection(c.id_content)}
                  />
                </td>

                <td className="p-2 font-medium">{c.title}</td>

                <td className="p-2 text-gray-600">
                  {c.topics?.map(t => t.label).join(", ") || "—"}
                </td>

                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(status)}`}>
                    {status}
                  </span>
                </td>

                <td className="p-2 text-gray-600">
                  {formatDate(c.source_date)}
                </td>

                <td className="p-2 text-gray-600">
                  {formatDate(c.published_at)}
                </td>

                <td className="p-2 text-right space-x-2">
                  {c.status === "DRAFT" && (
                    <button
                      onClick={() => handleReady(c.id_content)}
                      className="text-blue-600"
                    >
                      READY
                    </button>
                  )}

                  {c.status === "READY" && (
                    <button
                      onClick={() => handlePublish(c.id_content)}
                      className="text-green-600"
                    >
                      PUBLISH
                    </button>
                  )}

                  <Link
                    href={`/admin/content/edit/${c.id_content}`}
                    className="text-ratecard-blue"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    onClick={() => handleDelete(c.id_content)}
                    disabled={deletingId === c.id_content}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded"
          >
            Précédent
          </button>

          <span>Page {page} / {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  green,
  yellow,
  blue,
}: {
  label: string;
  value: number;
  green?: boolean;
  yellow?: boolean;
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
