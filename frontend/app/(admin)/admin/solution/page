"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

export default function EditSolution({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [idCompany, setIdCompany] = useState<string | null>(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    async function load() {
      const solRes = await api.get(`/solution/${id}`);
      const sol = solRes.solution;

      setName(sol.NAME);
      setDescription(sol.DESCRIPTION || "");
      setContent(sol.CONTENT);
      setStatus(sol.STATUS);
      setIdCompany(sol.ID_COMPANY);

      const compRes = await api.get("/company/list");
      setCompanies(compRes || []);

      setLoading(false);
    }
    load();
  }, [id]);

  async function save() {
    try {
      setSaving(true);
      await api.put(`/solution/update/${id}`, {
        name,
        description,
        content,
        status,
        id_company: idCompany,
      });
      alert("Solution mise à jour");
    } catch (e) {
      alert("Erreur mise à jour");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Modifier solution</h1>

      <input
        className="border p-2 w-full rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="border p-2 rounded w-full"
        value={idCompany || ""}
        onChange={(e) =>
          setIdCompany(e.target.value || null)
        }
      >
        <option value="">— Aucune société —</option>
        {companies.map((c: any) => (
          <option key={c.id_company} value={c.id_company}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        className="border p-2 w-full rounded h-24"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <HtmlEditor value={content} onChange={setContent} />

      <select
        className="border p-2 rounded"
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as "DRAFT" | "PUBLISHED")
        }
      >
        <option value="DRAFT">DRAFT</option>
        <option value="PUBLISHED">PUBLISHED</option>
      </select>

      <button
        onClick={save}
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
