"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Item = {
  id: string;
  title: string;
  status: string;
  is_vectorized: boolean;
  updated_at: string;
};

const PAGE_SIZE = 50;

export default function VectorPage() {

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [mode, setMode] = useState<"news" | "content">("news");

  const [search, setSearch] = useState("");
  const [showOnlyNotVectorized, setShowOnlyNotVectorized] = useState(false);

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ----------------------------------------
  // LOAD
  // ----------------------------------------

  const load = async () => {
    setLoading(true);

    try {
      const offset = (page - 1) * PAGE_SIZE;

      const res =
        mode === "news"
          ? await api.get(`/vector/news/status?limit=${PAGE_SIZE}&offset=${offset}`)
          : await api.get(`/vector/content/status?limit=${PAGE_SIZE}&offset=${offset}`);

      const mapped = (res?.items ?? []).map((i: any) => ({
        id: mode === "news" ? i.id_news : i.id_content,
        title: i.title,
        status: i.status,
        is_vectorized: i.is_vectorized,
        updated_at: i.updated_at,
      }));

      setItems(mapped);

    } catch (e) {
      console.error("Erreur chargement vectorisation", e);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [mode, page]);

  // reset UI
  useEffect(() => {
    setSearch("");
    setShowOnlyNotVectorized(false);
    setSelectedIds([]);
    setPage(1);
  }, [mode]);

  // ----------------------------------------
  // SELECTION
  // ----------------------------------------

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }

  function selectAllVisible() {
    const ids = filteredItems.map(i => i.id);
    setSelectedIds(ids);
  }

  function unselectAll() {
    setSelectedIds([]);
  }

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every(i => selectedIds.includes(i.id));

  function toggleSelectAll() {
    if (isAllSelected) {
      unselectAll();
    } else {
      selectAllVisible();
    }
  }

  // ----------------------------------------
  // FILTER + SORT
  // ----------------------------------------

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (showOnlyNotVectorized) {
      data = data.filter(i => !i.is_vectorized);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(i =>
        i.title?.toLowerCase().includes(s)
      );
    }

    data.sort((a, b) => {

      if (a.is_vectorized !== b.is_vectorized) {
        return a.is_vectorized ? 1 : -1;
      }

      return new Date(b.updated_at || 0).getTime() -
             new Date(a.updated_at || 0).getTime();
    });

    return data;

  }, [items, showOnlyNotVectorized, search]);

  const remaining = useMemo(() => {
    return items.filter(i => !i.is_vectorized).length;
  }, [items]);

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------

  const handleVectorize = async (id: string) => {

    setProcessingId(id);

    try {
      await api.post(`/vector/${mode}/${id}`, {});
      await load();
    } catch (e) {
      console.error("Erreur vectorisation", e);
    }

    setProcessingId(null);
  };

  const handleVectorizeSelected = async () => {

    if (!selectedIds.length) return;

    setLoading(true);

    try {
      await api.post(`/vector/${mode}/batch`, {
        ids: selectedIds
      });

      setSelectedIds([]);
      await load();

    } catch (e) {
      console.error("Erreur batch sélection", e);
    }

    setLoading(false);
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            Vectorisation — {mode === "news" ? "News" : "Analyses"}
          </h1>

          <div className="text-sm text-gray-500">
            {items.length} affichées — {remaining} à vectoriser
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">

          {/* MODE */}
          <button
            onClick={() => setMode("news")}
            className={`px-3 py-1 border rounded ${mode === "news" ? "bg-black text-white" : ""}`}
          >
            News
          </button>

          <button
            onClick={() => setMode("content")}
            className={`px-3 py-1 border rounded ${mode === "content" ? "bg-black text-white" : ""}`}
          >
            Analyses
          </button>

          {/* FILTER */}
          <button
            onClick={() => setShowOnlyNotVectorized(v => !v)}
            className={`px-3 py-1 border rounded ${
              showOnlyNotVectorized ? "bg-black text-white" : ""
            }`}
          >
            Non vectorisées
          </button>

          {/* REFRESH */}
          <button
            onClick={load}
            className="px-3 py-1 border rounded"
          >
            Rafraîchir
          </button>

          {/* SELECTION */}
          <button
            onClick={selectAllVisible}
            className="px-3 py-1 border rounded"
          >
            Sélectionner page
          </button>

          <button
            onClick={unselectAll}
            className="px-3 py-1 border rounded"
          >
            Clear
          </button>

          {/* BATCH */}
          <button
            onClick={handleVectorizeSelected}
            disabled={!selectedIds.length}
            className="px-3 py-1 bg-black text-white rounded disabled:opacity-30"
          >
            Vectoriser ({selectedIds.length})
          </button>

        </div>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded text-sm"
      />

      {/* TABLE */}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full border text-sm">

          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-2">Title</th>
              <th>Status</th>
              <th>Vectorisé</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-t">

                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>

                <td className="p-2">{item.title}</td>

                <td className="text-center text-xs">
                  {item.status}
                </td>

                <td className="text-center">
                  {item.is_vectorized ? "✅" : "❌"}
                </td>

                <td className="text-center text-xs text-gray-500">
                  {item.updated_at}
                </td>

                <td className="text-center">
                  <button
                    onClick={() => handleVectorize(item.id)}
                    disabled={processingId === item.id}
                    className="px-3 py-1 bg-black text-white rounded disabled:opacity-50"
                  >
                    {processingId === item.id ? "..." : "Vectoriser"}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 border rounded"
        >
          Précédent
        </button>

        <span>Page {page}</span>

        <button
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Suivant
        </button>
      </div>

    </div>
  );
}
