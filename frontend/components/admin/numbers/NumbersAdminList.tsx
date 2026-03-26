"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Option = {
  id: string;
  label: string;
};

type NumberItem = {
  ID_NUMBER: string;
  LABEL?: string;
  VALUE: number;
  UNIT?: string;
  SCALE?: string;
  ID_NUMBER_TYPE: string;
  ZONE?: string;
  PERIOD?: string;
  CREATED_AT?: string;
};

/* ========================================================= */

export default function NumbersAdminPage() {

  const [items, setItems] = useState<NumberItem[]>([]);

  const [types, setTypes] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [solutions, setSolutions] = useState<Option[]>([]);

  const [typeId, setTypeId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [solutionId, setSolutionId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ========================================================= */

  async function loadFilters() {
    try {

      const [typesRes, t, c, s] = await Promise.all([
        api.get("/numbers/types"),
        api.get("/topic/list"),
        api.get("/company/list"),
        api.get("/solution/list"),
      ]);

      const typesData = typesRes || [];
      const topicsData = t.topics || t.entities || t.items || t || [];
      const companiesData = c.companies || c.entities || c.items || c || [];
      const solutionsData = s.solutions || s.entities || s.items || s || [];

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

    } catch (e) {
      console.error(e);
    }
  }

  /* ========================================================= */

  async function search() {
    try {

      setLoading(true);

      const params = new URLSearchParams();

      if (typeId) params.append("id_number_type", typeId);
      if (topicId) params.append("topic_id", topicId);
      if (companyId) params.append("company_id", companyId);
      if (solutionId) params.append("solution_id", solutionId);

      const res = await api.get(`/numbers/search?${params.toString()}`);

      setItems(res.items || []);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  }

  /* ========================================================= */

  async function handleDelete(id: string) {

    if (!confirm("Supprimer ce number ?")) return;

    try {

      await api.delete(`/numbers/${id}`);

      setItems((prev) =>
        prev.filter((n) => n.ID_NUMBER !== id)
      );

    } catch (e) {
      console.error(e);
    }
  }

  /* ========================================================= */

  useEffect(() => {
    loadFilters();
  }, []);

  /* ========================================================= */

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-semibold text-ratecard-blue">
        Numbers Admin
      </h1>

      {/* ================== FILTERS ================== */}

      <div className="grid grid-cols-5 gap-2">

        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="border p-2"
        >
          <option value="">Type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="border p-2"
        >
          <option value="">Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2"
        >
          <option value="">Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={solutionId}
          onChange={(e) => setSolutionId(e.target.value)}
          className="border p-2"
        >
          <option value="">Solution</option>
          {solutions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={search}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>

      </div>

      {/* ================== RESULTS ================== */}

      <div className="border rounded">

        <div className="grid grid-cols-8 gap-2 p-2 text-xs font-semibold bg-gray-100">
          <div>Label</div>
          <div>Value</div>
          <div>Unit</div>
          <div>Scale</div>
          <div>Type</div>
          <div>Zone</div>
          <div>Period</div>
          <div></div>
        </div>

        {items.map((n) => (

          <div
            key={n.ID_NUMBER}
            className="grid grid-cols-8 gap-2 p-2 text-sm border-t"
          >
            <div>{n.LABEL || "-"}</div>
            <div>{n.VALUE}</div>
            <div>{n.UNIT}</div>
            <div>{n.SCALE}</div>
            <div>{n.ID_NUMBER_TYPE}</div>
            <div>{n.ZONE}</div>
            <div>{n.PERIOD}</div>

            <button
              onClick={() => handleDelete(n.ID_NUMBER)}
              className="text-red-600"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

      {loading && <div className="text-sm text-gray-500">Loading...</div>}

    </div>
  );
}
