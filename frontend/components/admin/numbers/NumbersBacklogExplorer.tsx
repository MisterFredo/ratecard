"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

export default function NumbersBacklogExplorer() {

  const [items, setItems] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeId, setTypeId] = useState("");

  // 🔥 FILTERS
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState("NULL");

  /* ========================================================= */

  async function load() {

    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (query) params.append("query", query);
      if (decision) params.append("decision", decision);

      const [res, typesRes] = await Promise.all([
        api.get(`/numbers/backlog?${params.toString()}`),
        api.get("/numbers/types"),
      ]);

      setItems(res.items || []);
      setTypes(typesRes || []);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  /* ========================================================= */

  async function handleIgnore(id: string) {

    try {

      await api.post(`/numbers/backlog/update/${id}`, {
        decision: "IGNORE",
      });

      // 🔥 FIX UX (pas de reload)
      setItems(prev => prev.filter(i => i.ID_BACKLOG !== id));

    } catch (e) {
      console.error(e);
    }
  }

  /* ========================================================= */

  async function handleCreate(item: any) {

    if (!typeId) {
      alert("Select a type");
      return;
    }

    try {

      await api.post("/numbers/", {
        label: item.LABEL,
        value: item.VALUE,
        unit: item.UNIT,
        id_number_type: typeId,
        zone: item.MARKET,
        period: item.PERIOD,
      });

      setItems(prev => prev.filter(i => i.ID_BACKLOG !== item.ID_BACKLOG));
      setSelectedId(null);
      setTypeId("");

    } catch (e) {
      console.error(e);
    }
  }

  /* ========================================================= */

  return (

    <div className="space-y-4">

      <h2 className="text-xl font-semibold">
        Backlog Review
      </h2>

      {/* 🔥 FILTER BAR */}
      <div className="flex gap-2 items-center">

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search label or actor..."
          className="border p-1 text-sm"
        />

        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          className="border p-1 text-sm"
        >
          <option value="">All</option>
          <option value="NULL">To review</option>
          <option value="IGNORE">Ignored</option>
        </select>

        <button
          onClick={load}
          className="bg-gray-200 px-2 py-1 text-sm rounded"
        >
          Apply
        </button>

      </div>

      {/* LOADING */}
      {loading && <div>Loading...</div>}

      {/* LIST */}
      {!loading && (

        <div className="border rounded">

          {items.map((item) => (

            <div
              key={item.ID_BACKLOG}
              className="border-t p-3 text-sm space-y-2"
            >

              {/* 🔹 CONTEXT */}
              <div className="text-xs text-gray-500">
                {item.context_title}
              </div>

              {/* 🔹 NUMBER DATA */}
              <div className="flex flex-wrap gap-4 items-center">

                <div className="font-medium">
                  {item.LABEL}
                </div>

                <div>
                  {item.VALUE} {item.UNIT}
                </div>

                <div className="text-gray-500">
                  {item.MARKET}
                </div>

                <div className="text-gray-500">
                  {item.PERIOD}
                </div>

                {item.ACTOR && (
                  <div className="text-gray-400">
                    {item.ACTOR}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="ml-auto flex gap-2">

                  <button
                    onClick={() => handleIgnore(item.ID_BACKLOG)}
                    className="text-red-600 text-xs"
                  >
                    Ignore
                  </button>

                  <button
                    onClick={() => setSelectedId(item.ID_BACKLOG)}
                    className="text-blue-600 text-xs"
                  >
                    Create
                  </button>

                </div>

              </div>

              {/* 🔹 CREATE PANEL */}
              {selectedId === item.ID_BACKLOG && (

                <div className="flex gap-2 mt-2">

                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    className="border p-1 text-sm"
                  >
                    <option value="">Type</option>
                    {types.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleCreate(item)}
                    className="bg-blue-600 text-white px-2 rounded text-sm"
                  >
                    Confirm
                  </button>

                </div>

              )}

            </div>

          ))}

          {items.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              No backlog items
            </div>
          )}

        </div>

      )}

    </div>
  );
}
