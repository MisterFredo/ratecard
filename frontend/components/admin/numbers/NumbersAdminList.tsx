"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Option = { id: string; label: string };

export default function NumbersAdminList() {

  const [items, setItems] = useState<any[]>([]);

  const [types, setTypes] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);

  const [typeId, setTypeId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [solutionId, setSolutionId] = useState("");

  /* ========================================================= */

  async function loadFilters() {

    const [typesRes, t, c, s] = await Promise.all([
      api.get("/numbers/types"),
      api.get("/topic/list"),
      api.get("/company/list"),
      api.get("/solution/list"),
    ]);

    setTypes(typesRes || []);
    setTopics(t.topics || []);
    setCompanies(c.companies || []);
    setSolutions(s.solutions || []);
  }

  async function search() {

    const params = new URLSearchParams();

    if (typeId) params.append("id_number_type", typeId);
    if (topicId) params.append("topic_id", topicId);
    if (companyId) params.append("company_id", companyId);
    if (solutionId) params.append("solution_id", solutionId);

    const res = await api.get(`/numbers/search?${params}`);

    setItems(res.items || []);
  }

  async function handleDelete(id: string) {

    if (!confirm("Delete ?")) return;

    await api.delete(`/numbers/${id}`);

    setItems(prev => prev.filter(i => i.ID_NUMBER !== id));
  }

  useEffect(() => {
    loadFilters();
  }, []);

  /* ========================================================= */

  function coherenceColor(c: string) {
    if (c === "HIGH") return "text-red-600";
    if (c === "MEDIUM") return "text-yellow-600";
    if (c === "OK") return "text-green-600";
    return "text-gray-400";
  }

  /* ========================================================= */

  return (

    <div className="space-y-6">

      <h2 className="text-xl font-semibold">Numbers Admin</h2>

      {/* FILTERS */}
      <div className="grid grid-cols-5 gap-2">

        <select onChange={(e) => setTypeId(e.target.value)} className="border p-2">
          <option value="">Type</option>
          {types.map((t: any) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <select onChange={(e) => setTopicId(e.target.value)} className="border p-2">
          <option value="">Topic</option>
          {topics.map((t: any) => (
            <option key={t.id_topic} value={t.id_topic}>{t.label}</option>
          ))}
        </select>

        <select onChange={(e) => setCompanyId(e.target.value)} className="border p-2">
          <option value="">Company</option>
          {companies.map((c: any) => (
            <option key={c.id_company} value={c.id_company}>{c.name}</option>
          ))}
        </select>

        <select onChange={(e) => setSolutionId(e.target.value)} className="border p-2">
          <option value="">Solution</option>
          {solutions.map((s: any) => (
            <option key={s.id_solution} value={s.id_solution}>{s.name}</option>
          ))}
        </select>

        <button onClick={search} className="bg-blue-600 text-white rounded">
          Search
        </button>

      </div>

      {/* TABLE */}
      <div className="border rounded">

        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] text-xs bg-gray-100 p-2 font-semibold">
          <div>Label</div>
          <div>Value</div>
          <div>Unit</div>
          <div>Scale</div>
          <div>Type</div>
          <div>Zone</div>
          <div>Period</div>
          <div>Coherence</div>
          <div></div>
        </div>

        {items.map((n) => (

          <div key={n.ID_NUMBER}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] text-sm p-2 border-t">

            <div>{n.LABEL || "-"}</div>
            <div>{n.VALUE}</div>
            <div>{n.UNIT}</div>
            <div>{n.SCALE}</div>
            <div>{n.TYPE_LABEL}</div>
            <div>{n.ZONE}</div>
            <div>{n.PERIOD}</div>

            <div className={coherenceColor(n.COHERENCE)}>
              {n.COHERENCE}
            </div>

            <button
              onClick={() => handleDelete(n.ID_NUMBER)}
              className="text-red-600"
            >
              Delete
            </button>

            {/* ENTITIES */}
            <div className="col-span-9 text-xs text-gray-500 mt-1">
              {(n.TOPICS || []).join(", ")} | {(n.COMPANIES || []).join(", ")} | {(n.SOLUTIONS || []).join(", ")}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
