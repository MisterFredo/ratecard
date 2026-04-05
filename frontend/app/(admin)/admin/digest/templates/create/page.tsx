"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

export default function AdminDigestTemplateCreatePage() {
  const [name, setName] = useState("");

  const [topics, setTopics] = useState<SelectOption[]>([]);
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [types, setTypes] = useState<SelectOption[]>([]);

  const [topicOptions, setTopicOptions] = useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);

  const [loading, setLoading] = useState(false);

  /* =========================================================
     LOAD REFERENTIALS (🔥 EXACTEMENT COMME DIGEST ENGINE)
  ========================================================= */

  useEffect(() => {
    async function load() {
      try {
        const t = await api.get("/topic/list");
        const c = await api.get("/company/list");
        const nt = await api.get("/news/types");

        const topicsRaw =
          Array.isArray(t)
            ? t
            : t?.result?.topics || t?.topics || t?.result || [];

        const companiesRaw =
          Array.isArray(c)
            ? c
            : c?.result?.companies || c?.companies || c?.result || [];

        const typesRaw =
          Array.isArray(nt)
            ? nt
            : nt?.result?.types || nt?.types || nt?.result || [];

        setTopicOptions(
          topicsRaw.map((x: any) => ({
            id: x.ID_TOPIC ?? x.id_topic ?? x.id,
            label: x.LABEL ?? x.label ?? x.name,
          }))
        );

        setCompanyOptions(
          companiesRaw.map((x: any) => ({
            id: x.ID_COMPANY ?? x.id_company ?? x.id,
            label: x.NAME ?? x.name,
          }))
        );

        setTypeOptions(
          typesRaw.map((x: any) => ({
            id: x.code || x.CODE || x.news_type || x.TYPE,
            label: x.label || x.LABEL,
          }))
        );

      } catch (e) {
        console.error("Erreur load référentiels", e);
      }
    }

    load();
  }, []);

  /* =========================================================
     SAVE
  ========================================================= */

  async function handleCreate() {
    setLoading(true);

    try {
      await api.post("/admin/digest/template", {
        name,
        topics: topics.map((t) => t.id),
        companies: companies.map((c) => c.id),
        news_types: types.map((t) => t.id),
      });

      alert("Template créé");

    } catch (e) {
      console.error(e);
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="max-w-3xl space-y-6">

      <h1 className="text-lg font-semibold">
        Nouveau template
      </h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="Nom du template"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <SearchableMultiSelect
        label="Topics"
        options={topicOptions}
        values={topics}
        onChange={setTopics}
      />

      <SearchableMultiSelect
        label="Sociétés"
        options={companyOptions}
        values={companies}
        onChange={setCompanies}
      />

      <SearchableMultiSelect
        label="Types"
        options={typeOptions}
        values={types}
        onChange={setTypes}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Créer
      </button>

    </div>
  );
}
