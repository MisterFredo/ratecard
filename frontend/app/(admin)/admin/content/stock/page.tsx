"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import StockImportPanel from "@/components/admin/stock/StockImportPanel";
import StockFilters from "@/components/admin/stock/StockFilters";
import StockTable from "@/components/admin/stock/StockTable";
import RawDrawer from "@/components/admin/stock/RawDrawer";

const PAGE_SIZE = 50;

export default function ContentStockPage() {

  const [raws, setRaws] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedRaw, setSelectedRaw] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    source_id: "",
    import_type: "",
  });

  async function load() {
    const offset = (page - 1) * PAGE_SIZE;

    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append("status", filters.status);
    if (filters.source_id) queryParams.append("source_id", filters.source_id);
    if (filters.import_type) queryParams.append("import_type", filters.import_type);

    queryParams.append("limit", PAGE_SIZE.toString());
    queryParams.append("offset", offset.toString());

    const [listRes, statsRes] = await Promise.all([
      api.get(`/content/raw/stock?${queryParams.toString()}`),
      api.get("/content/raw/admin/stats"),
    ]);

    setRaws(listRes.rows || []);
    setTotal(listRes.total || 0);
    setStats(statsRes.stats || null);
  }

  useEffect(() => { load(); }, [filters, page]);

  useEffect(() => {
    async function loadSources() {
      const res = await api.get("/content/source/list");
      setSources(res.sources || []);
    }
    loadSources();
  }, []);

  async function handleDestock(id?: string) {
    if (!confirm("Confirmer ?")) return;
    setProcessing(true);
    await api.post("/content/raw/destock", id ? { id_raw: id } : { limit: 50 });
    await load();
    setProcessing(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Stock RAW
        </h1>

        <button
          onClick={() => handleDestock()}
          disabled={processing}
          className="bg-ratecard-green text-white px-3 py-2 rounded text-sm"
        >
          Déstocker
        </button>
      </div>

      {stats && (
        <div className="flex gap-6 text-sm">
          <span>Total: {stats.total}</span>
          <span>Stock: {stats.total_stored}</span>
          <span>Processing: {stats.total_processing}</span>
          <span>OK: {stats.total_processed}</span>
          <span className="text-red-600">Error: {stats.total_error}</span>
        </div>
      )}

      <div className="flex gap-4 border p-4 rounded bg-gray-50">
        <StockImportPanel sources={sources} onImported={load} />

        <StockFilters
          sources={sources}
          status={filters.status}
          sourceId={filters.source_id}
          importType={filters.import_type}
          total={total}
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
      </div>

      <StockTable
        raws={raws}
        onDestock={handleDestock}
        onRetry={(id) => api.post(`/content/raw/retry/${id}`).then(load)}
        onDelete={(id) => api.delete(`/content/raw/delete/${id}`).then(load)}
        onOpen={(raw) => setSelectedRaw(raw)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Précédent
          </button>

          <span>
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

      <RawDrawer
        raw={selectedRaw}
        onClose={() => setSelectedRaw(null)}
        onSaved={load}
      />

    </div>
  );
}
