"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Play } from "lucide-react";

type RawItem = {
  id_raw: string;
  source_id: string;
  source_title: string;
  date_source?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
};

type RawStats = {
  total: number;
  total_stored: number;
  total_processing: number;
  total_processed: number;
  total_error: number;
};

const PAGE_SIZE = 50;

export default function ContentStockPage() {
  const [raws, setRaws] = useState<RawItem[]>([]);
  const [stats, setStats] = useState<RawStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");

  // =========================
  // LOAD
  // =========================

  async function load() {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      if (statusFilter) queryParams.append("status", statusFilter);
      if (sourceFilter) queryParams.append("source_id", sourceFilter);

      const [listRes, statsRes] = await Promise.all([
        api.get(`/content/raw/stock?${queryParams.toString()}`),
        api.get("/content/raw/admin/stats"),
      ]);

      setRaws(listRes.raws || []);
      setStats(statsRes.stats || null);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement stock");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    setPage(1);
  }, [statusFilter, sourceFilter]);

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(raws.length / PAGE_SIZE);

  const paginatedRaws = raws.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // =========================
  // STATUS STYLE
  // =========================

  function getStatusClasses(status: string) {
    if (status === "STORED")
      return "bg-yellow-100 text-yellow-700";
    if (status === "PROCESSING")
      return "bg-blue-100 text-blue-700";
    if (status === "PROCESSED")
      return "bg-green-100 text-green-700";
    if (status === "ERROR")
      return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  // =========================
  // ACTIONS
  // =========================

  async function handleDestockBatch() {
    if (!window.confirm("Générer les 10 plus anciens contenus ?")) return;

    setProcessing(true);
    await api.post("/content/raw/destock", { limit: 10 });
    await load();
    setProcessing(false);
  }

  async function handleDestockOne(id: string) {
    if (!window.confirm("Générer ce contenu ?")) return;

    setProcessing(true);
    await api.post("/content/raw/destock-one", { id_raw: id });
    await load();
    setProcessing(false);
  }

  async function handleRetry(id: string) {
    if (!window.confirm("Relancer cette source en erreur ?")) return;

    await api.post(`/content/raw/retry/${id}`);
    await load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette source ?")) return;

    try {
      setDeletingId(id);
      await api.delete(`/content/raw/delete/${id}`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Stock des sources
        </h1>

        <button
          onClick={handleDestockBatch}
          disabled={processing}
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          {processing ? "Traitement..." : "Déstocker les 10 plus anciens"}
        </button>
      </div>

      {/* STATS */}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="En stock" value={stats.total_stored} yellow />
          <StatCard label="En cours" value={stats.total_processing} />
          <StatCard label="Traités" value={stats.total_processed} />
          <StatCard label="Erreurs" value={stats.total_error} red />
        </div>
      )}

      {/* FILTERS */}

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="ERROR">Erreur</option>
          <option value="STORED">Stored</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
        </select>

        <input
          type="text"
          placeholder="Filtrer par source..."
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border rounded p-2 text-sm"
        />
      </div>

      {/* TABLE */}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Source</th>
            <th className="p-2">Titre source</th>
            <th className="p-2">Date source</th>
            <th className="p-2">Créé le</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Erreur</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRaws.map((r) => (
            <tr key={r.id_raw} className="border-b hover:bg-gray-50 transition">

              <td className="p-2 text-gray-600">
                {r.source_id}
              </td>

              <td className="p-2 font-medium">
                {r.source_title}
              </td>

              <td className="p-2 text-gray-600">
                {formatDate(r.date_source)}
              </td>

              <td className="p-2 text-gray-600">
                {formatDate(r.created_at)}
              </td>

              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(r.status)}`}>
                  {r.status}
                </span>
              </td>

              <td className="p-2 text-xs text-red-600 max-w-xs truncate">
                {r.status === "ERROR" ? r.error_message : ""}
              </td>

              <td className="p-2 text-right space-x-3">

                {r.status === "STORED" && (
                  <button
                    onClick={() => handleDestockOne(r.id_raw)}
                    className="inline-flex items-center text-green-600 hover:text-green-800"
                  >
                    <Play size={16} />
                  </button>
                )}

                {r.status === "ERROR" && (
                  <button
                    onClick={() => handleRetry(r.id_raw)}
                    className="inline-flex items-center text-orange-600 hover:text-orange-800"
                  >
                    ↺
                  </button>
                )}

                <button
                  onClick={() => handleDelete(r.id_raw)}
                  disabled={deletingId === r.id_raw}
                  className="inline-flex items-center text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Précédent
          </button>

          <span className="text-sm">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
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
  yellow,
  red,
}: {
  label: string;
  value: number;
  yellow?: boolean;
  red?: boolean;
}) {
  let bg = "bg-white";
  let text = "text-gray-800";

  if (yellow) {
    bg = "bg-yellow-50";
    text = "text-yellow-700";
  }

  if (red) {
    bg = "bg-red-50";
    text = "text-red-700";
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
