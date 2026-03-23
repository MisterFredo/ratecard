"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Option = {
  id: string;
  label: string;
};

export default function NumbersManualCreate() {

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [context, setContext] = useState("");
  const [sourceId, setSourceId] = useState("");

  const [topics, setTopics] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);
  const [sources, setSources] = useState<Option[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD OPTIONS
  ========================================================= */

  async function loadOptions() {
    try {

      const [t, c, s, src] = await Promise.all([
        api.get("/topic"),
        api.get("/company"),
        api.get("/solution"),
        api.get("/source"),
      ]);

      setTopics(
        (t.entities || []).map((x: any) => ({
          id: x.id_topic,
          label: x.label,
        }))
      );

      setCompanies(
        (c.entities || []).map((x: any) => ({
          id: x.id_company,
          label: x.name,
        }))
      );

      setSolutions(
        (s.entities || []).map((x: any) => ({
          id: x.id_solution,
          label: x.name,
        }))
      );

      setSources(
        (src.entities || []).map((x: any) => ({
          id: x.id_source,
          label: x.name,
        }))
      );

    } catch (e) {
      console.error("Erreur load options", e);
    }
  }

  useEffect(() => {
    loadOptions();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  function toggle(list: string[], setList: any, id: string) {
    setList(
      list.includes(id)
        ? list.filter((i) => i !== id)
        : [...list, id]
    );
  }

  /* =========================================================
     CREATE
  ========================================================= */

  async function handleCreate() {

    if (!label || !value) {
      alert("Label + Value requis");
      return;
    }

    try {

      setLoading(true);

      await api.post("/numbers/structured/create", {
        source_id: sourceId || null,
        label,
        value,
        unit,
        context,
        topic_ids: selectedTopics,
        company_ids: selectedCompanies,
        solution_ids: selectedSolutions,
      });

      // reset
      setLabel("");
      setValue("");
      setUnit("");
      setContext("");
      setSourceId("");
      setSelectedTopics([]);
      setSelectedCompanies([]);
      setSelectedSolutions([]);

      alert("✔ Chiffre créé");

    } catch (e) {
      console.error("Erreur create manual number", e);
    }

    setLoading(false);
  }

  /* ========================================================= */

  return (

    <div className="border rounded p-4 space-y-4">

      <h2 className="font-semibold">
        Ajouter un chiffre manuel
      </h2>

      {/* ================== CORE FIELDS ================== */}

      <div className="grid grid-cols-5 gap-2">

        <input
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="border p-2"
        />

        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="border p-2"
        >
          <option value="">Source (optionnel)</option>

          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

      </div>

      {/* ================== TOPICS ================== */}

      <div>
        <p className="text-xs text-gray-500 mb-1">Topics</p>
        <div className="flex flex-wrap gap-2">

          {topics.map((t) => (
            <label key={t.id} className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedTopics.includes(t.id)}
                onChange={() =>
                  toggle(selectedTopics, setSelectedTopics, t.id)
                }
              />
              {t.label}
            </label>
          ))}

        </div>
      </div>

      {/* ================== COMPANIES ================== */}

      <div>
        <p className="text-xs text-gray-500 mb-1">Companies</p>
        <div className="flex flex-wrap gap-2">

          {companies.map((c) => (
            <label key={c.id} className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedCompanies.includes(c.id)}
                onChange={() =>
                  toggle(selectedCompanies, setSelectedCompanies, c.id)
                }
              />
              {c.label}
            </label>
          ))}

        </div>
      </div>

      {/* ================== SOLUTIONS ================== */}

      <div>
        <p className="text-xs text-gray-500 mb-1">Solutions</p>
        <div className="flex flex-wrap gap-2">

          {solutions.map((s) => (
            <label key={s.id} className="text-xs flex items-center gap-1">
              <input
                type="checkbox"
                checked={selectedSolutions.includes(s.id)}
                onChange={() =>
                  toggle(selectedSolutions, setSelectedSolutions, s.id)
                }
              />
              {s.label}
            </label>
          ))}

        </div>
      </div>

      {/* ================== ACTION ================== */}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Création..." : "Créer"}
      </button>

    </div>
  );
}
