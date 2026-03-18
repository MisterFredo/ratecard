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

export default function VectorPage() {

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [mode, setMode] = useState<"news" | "content">("news");
  const [showOnlyNotVectorized, setShowOnlyNotVectorized] = useState(false);
  const [search, setSearch] = useState("");

  // ----------------------------------------
  // LOAD
  // ----------------------------------------

  const load = async () => {
    setLoading(true);

    try {
      const res =
        mode === "news"
          ? await api.get("/vector/news/status")
          : await api.get("/vector/content/status");

      const mapped = (res?.items ?? []).map((i: any) => ({
        id: mode === "news" ? i.id_news : i.id_content, // ✅ FIX CRITIQUE
        type: mode,
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
  }, [mode]);

  // ----------------------------------------
  // RESET UI ON MODE CHANGE
  // ----------------------------------------

  useEffect(() => {
    setSearch("");
    setShowOnlyNotVectorized(false);
  }, [mode]);

  // ----------------------------------------
  // FILTER + SORT
  // ----------------------------------------

  const filteredItems = useMemo(() => {
    let data = [...items];

    if (showOnlyNotVectorized) {
      data = data.filter((i) => !i.is_vectorized);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((i) =>
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
    return filteredItems.filter((i) => !i.is_vectorized).length;
  }, [filteredItems]);

  const notVectorizedCount = useMemo(() => {
    return items.filter((i) => !i.is_vectorized).length;
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

  const handleVectorizeAll = async () => {

    const ids = filteredItems
      .filter((i) => !i.is_vectorized)
      .map((i) => i.id)
      .filter(Boolean); // ✅ SAFE

    if (ids.length === 0) return;

    setLoading(true);

    try {
      await api.post(`/vector/${mode}/batch`, { ids });
      await load();
    } catch (e) {
      console.error("Erreur batch", e);
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
            {filteredItems.length} affichées / {items.length} total — {notVectorizedCount} à vectoriser
          </div>
        </div>

        <div className="flex gap-2">

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
            onClick={() => setShowOnlyNotVectorized((v) => !v)}
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

          {/* BATCH */}
          <button
            onClick={handleVectorizeAll}
            disabled={remaining === 0}
            className="px-3 py-1 bg-black text-white rounded disabled:opacity-30"
          >
            Vectoriser ({remaining})
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

                <td className="p-2">
                  {item.title}
                </td>

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
    </div>
  );
}
