"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StockImportPanel from "@/components/admin/stock/StockImportPanel";
import StockFilters from "@/components/admin/stock/StockFilters";
import StockTable from "@/components/admin/stock/StockTable";
import RawDrawer from "@/components/admin/stock/RawDrawer";

type RawItem = {
  id_raw: string;
  source_id: string;
  source_name: string | null;
  source_title: string;
  date_source?: string | null;
  status: string;
  error_message?: string | null;
  created_at: string;
  import_type?: "FILE" | "URL" | null;
};

type RawStats = {
  total: number;
  total_stored: number;
  total_processing: number;
  total_processed: number;
  total_error: number;
};

type SourceItem = {
  id_source: string;
  label: string;
};

export default function ContentStockPage() {

  const [raws, setRaws] = useState<RawItem[]>([]);
  const [stats, setStats] = useState<RawStats | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRaw, setSelectedRaw] = useState<RawItem | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    source_id: "",
  });

  // =========================
  // LOAD DATA
  // =========================

  async function load() {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.source_id) queryParams.append("source_id", filters.source_id);

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
  }, [filters]);

  useEffect(() => {
    async function loadSources() {
      const res = await api.get("/content/source/list");
      setSources(res.sources || []);
    }
    loadSources();
  }, []);

  // =========================
  // ACTIONS
  // =========================

  async function handleDestock(id?: string) {
    if (!confirm("Confirmer la génération ?")) return;

    setProcessing(true);

    await api.post("/content/raw/destock", id ? { id_raw: id } : { limit: 50 });

    await load();
    setProcessing(false);
  }

  async function handleRetry(id: string) {
    if (!confirm("Relancer cette entrée ?")) return;
    await api.post(`/content/raw/retry/${id}`, {});
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette entrée ?")) return;
    await api.delete(`/content/raw/delete/${id}`);
    await load();
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Stock des sources
        </h1>

        <button
          onClick={() => handleDestock()}
          disabled={processing}
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          {processing ? "Traitement..." : "Déstocker le stock"}
        </button>
      </div>

      {/* IMPORT */}
      <StockImportPanel
        sources={sources}
        onImported={load}
      />

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
      <StockFilters
        sources={sources}
        status={filters.status}
        sourceId={filters.source_id}
        importType={filters.import_type}
        total={raws.length}
        onStatusChange={(v) =>
          setFilters((prev) => ({ ...prev, status: v }))
        }
        onSourceChange={(v) =>
          setFilters((prev) => ({ ...prev, source_id: v }))
        }
        onImportTypeChange={(v) =>
          setFilters((prev) => ({ ...prev, import_type: v }))
        }
      />

      {/* TABLE */}
      <StockTable
        raws={raws}
        onDestock={handleDestock}
        onRetry={handleRetry}
        onDelete={handleDelete}
        onOpen={(raw) => setSelectedRaw(raw)}
      />

      {/* DRAWER */}
      <RawDrawer
        raw={selectedRaw}
        onClose={() => setSelectedRaw(null)}
        onSaved={load}
      />

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
