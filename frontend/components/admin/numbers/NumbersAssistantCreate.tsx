"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Option = {
  id: string;
  label: string;
};

type RawNumber = {
  id_content: string;
  label: string;
  value: number;
  unit: string;
  scale?: string | null;
  actor: string;
  market: string;
  period: string;
};

/* ========================================================= */

export default function NumbersAssistantCreate() {

  const [items, setItems] = useState<RawNumber[]>([]);
  const [selected, setSelected] = useState<RawNumber | null>(null);

  const [types, setTypes] = useState<Option[]>([]);
  const [numberType, setNumberType] = useState("");

  const [topics, setTopics] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);
  const [sources, setSources] = useState<Option[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<string[]>([]);
  const [sourceId, setSourceId] = useState("");

  const [loading, setLoading] = useState(false);

  const [openTopics, setOpenTopics] = useState(false);
  const [openCompanies, setOpenCompanies] = useState(false);
  const [openSolutions, setOpenSolutions] = useState(false);

  /* ========================================================= */

  async function loadAll() {
    try {

      const [raw, typesRes, t, c, s, src] = await Promise.all([
        api.get("/numbers/raw"),
        api.get("/numbers/types"),
        api.get("/topic/list"),
        api.get("/company/list"),
        api.get("/solution/list"),
        api.get("/source/list"),
      ]);

      setItems(raw.items || []);

      const typesData = typesRes || [];
      const topicsData = t.topics || t.entities || t.items || t || [];
      const companiesData = c.companies || c.entities || c.items || c || [];
      const solutionsData = s.solutions || s.entities || s.items || s || [];
      const sourcesData = src.sources || src.entities || src.items || src || [];

      setTypes(typesData.map((x: any) => ({
        id: x.id,
        label: x.label,
      })));

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

    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadAll();
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

    if (!selected || !numberType) {
      alert("Sélection + type requis");
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

      await api.post("/numbers/", {
        label: selected.label,
        value: selected.value,
        unit: selected.unit,
        scale: selected.scale || null,
        id_number_type: numberType,
        zone: selected.market,
        period: selected.period,
        source_id: sourceId || null,

        company_ids: selectedCompanies,
        topic_ids: selectedTopics,
        solution_ids: selectedSolutions,
      });

      setItems((prev) =>
        prev.filter((i) => i !== selected)
      );

      setSelected(null);
      setSelectedTopics([]);
      setSelectedCompanies([]);
      setSelectedSolutions([]);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  /* ========================================================= */

  return (

    <div className="border rounded p-4 space-y-4">

      <h2 className="font-semibold">
        Assistant (depuis contenus)
      </h2>

      {/* ================== LIST ================== */}

      <div className="max-h-64 overflow-y-auto border p-2 space-y-2">

        {items.map((item, i) => (

          <div
            key={i}
            onClick={() => setSelected(item)}
            className={`p-2 border cursor-pointer text-sm ${
              selected === item ? "bg-blue-50" : ""
            }`}
          >
            <div className="font-medium">
              {item.label}
            </div>

            <div className="text-xs text-gray-500">
              {item.value} {item.unit}
              {item.scale ? ` (${item.scale})` : ""} | {item.market} | {item.period}
            </div>

            <div className="text-xs text-gray-400">
              {item.actor}
            </div>

          </div>
        ))}

      </div>

      {/* ================== EDIT ================== */}

      {selected && (

        <div className="space-y-4 border p-3 rounded">

          <div className="text-sm font-medium">
            Validation
          </div>

          {/* CORE */}
          <div className="grid grid-cols-5 gap-2">

            <input value={selected.value} readOnly className="border p-2" />
            <input value={selected.unit} readOnly className="border p-2" />
            <input value={selected.scale || ""} readOnly className="border p-2" />
            <input value={selected.market} readOnly className="border p-2" />
            <input value={selected.period} readOnly className="border p-2" />

          </div>

          {/* TYPE */}
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

          {/* SOURCE */}
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

          {/* ENTITIES */}

          <div className="text-xs text-gray-500">
            Associer au moins une entité
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

          {/* ACTION */}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Création..." : "Créer ce number"}
          </button>

        </div>

      )}

    </div>
  );
}
