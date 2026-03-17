"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type NewsItem = {
  id_news: string;
  title: string;
  status: string;
  is_vectorized: boolean;
  updated_at: string;
};

export default function VectorPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showOnlyNotVectorized, setShowOnlyNotVectorized] = useState(false);

  // ----------------------------------------
  // LOAD DATA
  // ----------------------------------------

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vector/news/status");
      setItems(res?.items ?? []);
    } catch (e) {
      console.error("Erreur chargement vectorisation", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ----------------------------------------
  // FILTER + SORT
  // ----------------------------------------

  const filteredItems = useMemo(() => {
    let data = [...items];

    // filtre
    if (showOnlyNotVectorized) {
      data = data.filter((i) => !i.is_vectorized);
    }

    // tri : non vectorisés en premier
    data.sort((a, b) => {
      if (a.is_vectorized === b.is_vectorized) return 0;
      return a.is_vectorized ? 1 : -1;
    });

    return data;
  }, [items, showOnlyNotVectorized]);

  const notVectorizedCount = useMemo(() => {
    return items.filter((i) => !i.is_vectorized).length;
  }, [items]);

  // ----------------------------------------
  // ACTIONS
  // ----------------------------------------

  const handleVectorize = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/vector/news/${id}`, {});
      await load();
    } catch (e) {
      console.error("Erreur vectorisation", e);
    }
    setProcessingId(null);
  };

  const handleVectorizeAll = async () => {
    const ids = filteredItems
      .filter((i) => !i.is_vectorized)
      .map((i) => i.id_news);

    if (ids.length === 0) return;

    setLoading(true);

    try {
      await api.post("/vector/news/batch", { ids });
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

        <div>
          <h1 className="text-xl font-semibold">
            Vectorisation — News
          </h1>

          <div className="text-sm text-gray-500">
            {filteredItems.length} affichées / {items.length} total — {notVectorizedCount} à vectoriser
          </div>
        </div>

        <div className="flex gap-2">

          <button
            onClick={load}
            className="px-3 py-1 border rounded"
          >
            Rafraîchir
          </button>

          <button
            onClick={() => setShowOnlyNotVectorized((v) => !v)}
            className={`px-3 py-1 border rounded ${
              showOnlyNotVectorized ? "bg-black text-white" : ""
            }`}
          >
            Non vectorisées
          </button>

          <button
            onClick={handleVectorizeAll}
            className="px-3 py-1 bg-black text-white rounded"
          >
            Vectoriser visibles
          </button>

        </div>
      </div>

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
              <tr key={item.id_news} className="border-t">

                {/* TITLE */}
                <td className="p-2">
                  {item.title}
                </td>

                {/* STATUS */}
                <td className="text-center">
                  {item.status}
                </td>

                {/* VECTOR */}
                <td className="text-center">
                  {item.is_vectorized ? "✅" : "❌"}
                </td>

                {/* UPDATED */}
                <td className="text-center text-xs text-gray-500">
                  {item.updated_at}
                </td>

                {/* ACTION */}
                <td className="text-center">
                  <button
                    onClick={() => handleVectorize(item.id_news)}
                    disabled={processingId === item.id_news}
                    className="px-3 py-1 bg-black text-white rounded disabled:opacity-50"
                  >
                    {processingId === item.id_news
                      ? "..."
                      : "Vectoriser"}
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
