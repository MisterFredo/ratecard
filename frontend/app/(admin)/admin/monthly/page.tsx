"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Entity = {
  id: string;
  name: string;
};

/* ========================================================= */

export default function MonthlyPage() {

  const [entityType, setEntityType] = useState<"topic" | "company" | "solution">("topic");
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD ENTITIES
  ========================================================= */

  async function loadEntities(type: string) {
    try {
      const res = await api.get(`/${type}/list`);
      const list = res[`${type}s`] || [];

      setEntities(list);
      setSelectedIds(list.map((e: any) => e.id)); // 🔥 tous sélectionnés par défaut

    } catch (e) {
      console.error("Erreur load entities", e);
    }
  }

  useEffect(() => {
    loadEntities(entityType);
  }, [entityType]);

  /* =========================================================
     TOGGLE SELECTION
  ========================================================= */

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  /* =========================================================
     GENERATE
  ========================================================= */

  async function handleGenerate() {

    if (selectedIds.length === 0) {
      alert("Aucune entité sélectionnée");
      return;
    }

    if (!confirm("Lancer la génération ?")) return;

    setLoading(true);

    try {

      const promises = selectedIds.map((id) =>
        api.post("/admin/monthly-insight/generate", {
          entity_type: entityType,
          entity_id: id,
          year,
          month,
        })
      );

      const res = await Promise.all(promises);

      setResults(res.map((r: any) => r.result));

    } catch (e) {
      console.error("Erreur generate", e);
      alert("Erreur génération");
    }

    setLoading(false);
  }

  /* =========================================================
     VALIDATE ALL
  ========================================================= */

  async function handleValidateAll() {

    if (!confirm("Valider tous les insights ?")) return;

    try {

      await Promise.all(
        results.map((r) =>
          api.put(`/admin/monthly-insight/${r.id_insight}`, {
            status: "VALIDATED",
          })
        )
      );

      alert("Validation effectuée");

    } catch (e) {
      console.error("Erreur validation", e);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-ratecard-blue">
          Monthly Insights
        </h1>
      </div>

      {/* ENTITY TYPE */}
      <div className="flex gap-4">
        {["topic", "company", "solution"].map((t) => (
          <button
            key={t}
            onClick={() => setEntityType(t as any)}
            className={`px-3 py-1 rounded border ${
              entityType === t ? "bg-black text-white" : ""
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* MONTH / YEAR */}
      <div className="flex gap-4">

        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-2 py-1"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-2 py-1 w-24"
        />
      </div>

      {/* ENTITIES LIST */}
      <div className="border rounded p-4 max-h-[300px] overflow-auto bg-white">
        {entities.map((e) => (
          <label key={e.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedIds.includes(e.id)}
              onChange={() => toggle(e.id)}
            />
            {e.name}
          </label>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <button
          onClick={handleValidateAll}
          className="border px-4 py-2 rounded"
        >
          Valider tout
        </button>

      </div>

      {/* RESULTS */}
      <div className="space-y-6">

        {results.map((r, i) => (
          <div key={i} className="bg-white border p-4 rounded">

            <div className="text-sm text-gray-400 mb-2">
              {r.status}
            </div>

            <ul className="list-disc pl-4 space-y-1 text-sm">
              {r.key_points?.map((p: string, j: number) => (
                <li key={j}>{p}</li>
              ))}
            </ul>

          </div>
        ))}

      </div>

    </div>
  );
}
