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
  const [scale, setScale] = useState("");
  const [zone, setZone] = useState("");
  const [period, setPeriod] = useState("");
  const [numberType, setNumberType] = useState("");
  const [sourceId, setSourceId] = useState("");

  const [topics, setTopics] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);
  const [sources, setSources] = useState<Option[]>([]);
  const [types, setTypes] = useState<Option[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<any>(null);

  const [openTopics, setOpenTopics] = useState(false);
  const [openCompanies, setOpenCompanies] = useState(false);
  const [openSolutions, setOpenSolutions] = useState(false);

  /* ========================================================= */

  async function loadOptions() {
    try {

      const [t, c, s, src, typesRes] = await Promise.all([
        api.get("/topic/list"),
        api.get("/company/list"),
        api.get("/solution/list"),
        api.get("/source/list"),
        api.get("/numbers/types"),
      ]);

      const topicsData = t.topics || t.entities || t.items || t || [];
      const companiesData = c.companies || c.entities || c.items || c || [];
      const solutionsData = s.solutions || s.entities || s.items || s || [];
      const sourcesData = src.sources || src.entities || src.items || src || [];
      const typesData = typesRes || [];

      setTopics(topicsData.map((x: any) => ({
        id: x.id_topic || x.id,
        label: x.label,
      })));

      setCompanies(companiesData.map((x: any) => ({
        id: x.id_company || x.id,
        label: x.name || x.label,
      })));

      setSolutions(solutionsData.map((x: any) => ({
        id: x.id_solution || x.id,
        label: x.name || x.label,
      })));

      setSources(sourcesData.map((x: any) => ({
        id: x.source_id || x.id,
        label: x.name || x.label,
      })));

      setTypes(typesData.map((x: any) => ({
        id: x.id,
        label: x.label,
      })));

    } catch (e) {
      console.error("Erreur load options", e);
    }
  }

  useEffect(() => {
    loadOptions();
  }, []);

  /* ========================================================= */

  function toggle(list: string[], setList: any, id: string) {
    setList(
      list.includes(id)
        ? list.filter((i) => i !== id)
        : [...list, id]
    );
  }

  /* ========================================================= */

  async function handleCreate() {

    if (!value || !numberType) {
      alert("Value + Number Type requis");
      return;
    }

    if (
      selectedCompanies.length === 0 &&
      selectedTopics.length === 0 &&
      selectedSolutions.length === 0
    ) {
      alert("Au moins une entité requise");
      return;
    }

    try {

      setLoading(true);
      setQuality(null);

      const res = await api.post("/numbers/", {
        label,
        value: parseFloat(value),
        unit,
        scale: scale || null,
        id_number_type: numberType,
        zone,
        period,
        source_id: sourceId || null,

        company_ids: selectedCompanies,
        topic_ids: selectedTopics,
        solution_ids: selectedSolutions,
      });

      setQuality(res.quality);

      setValue("");
      setUnit("");
      setScale("");
      setZone("");
      setPeriod("");
      setSelectedTopics([]);
      setSelectedCompanies([]);
      setSelectedSolutions([]);

    } catch (e) {
      console.error("Erreur create number", e);
    }

    setLoading(false);
  }

  /* ========================================================= */

  return (

    <div className="border rounded p-4 space-y-4">

      <h2 className="font-semibold">
        Create Number
      </h2>

      {/* ================== CORE ================== */}

      <div className="grid grid-cols-6 gap-2">

        <input
          placeholder="Label (ex: Marché publicité digitale Europe croissance)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border p-2 col-span-2"
        />
        
        <input
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Unit (EUR, PERCENT...)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Scale (million, billion...)"
          value={scale}
          onChange={(e) => setScale(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Zone (US, FR...)"
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="border p-2"
        />

        <input
          placeholder="Period (2025, Q1...)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border p-2"
        />

        <select
          value={numberType}
          onChange={(e) => setNumberType(e.target.value)}
          className="border p-2"
        >
          <option value="">Number Type *</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

      </div>

      {/* ================== SOURCE ================== */}

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

      {/* ================== ENTITIES ================== */}

      <div className="text-xs text-gray-500">
        Au moins une entité requise
      </div>

      {/* TOPICS */}
      <div>
        <button onClick={() => setOpenTopics(!openTopics)} className="text-xs">
          {openTopics ? "▼ Topics" : "▶ Topics"}
        </button>

        {openTopics && (
          <div className="flex flex-wrap gap-2 mt-2">
            {topics.map((t) => (
              <label key={t.id} className="text-xs">
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
        )}
      </div>

      {/* COMPANIES */}
      <div>
        <button onClick={() => setOpenCompanies(!openCompanies)} className="text-xs">
          {openCompanies ? "▼ Companies" : "▶ Companies"}
        </button>

        {openCompanies && (
          <div className="flex flex-wrap gap-2 mt-2">
            {companies.map((c) => (
              <label key={c.id} className="text-xs">
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
        )}
      </div>

      {/* SOLUTIONS */}
      <div>
        <button onClick={() => setOpenSolutions(!openSolutions)} className="text-xs">
          {openSolutions ? "▼ Solutions" : "▶ Solutions"}
        </button>

        {openSolutions && (
          <div className="flex flex-wrap gap-2 mt-2">
            {solutions.map((s) => (
              <label key={s.id} className="text-xs">
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
        )}
      </div>

      {/* ================== QUALITY ================== */}

      {quality && (
        <div className="text-sm border p-2 rounded bg-gray-50">

          {quality.status === "duplicate" && (
            <div className="text-orange-600">
              ⚠️ Duplicate probable — vérifie les données existantes
            </div>
          )}

          {quality.status === "warning" && (
            <div className="text-yellow-600">
              ⚠️ Valeur atypique (hors range habituel)
            </div>
          )}

          {quality.status === "ok" && (
            <div className="text-green-600">
              ✔ Donnée cohérente
            </div>
          )}

        </div>
      )}

      {/* ================== ACTION ================== */}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>

    </div>
  );
}
