"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Company = {
  id_company: string;
  name: string;
};

export default function EditSolution({ params }: { params: { id: string } }) {

  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [idCompany, setIdCompany] =
    useState<string | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {

    async function load() {

      try {

        // ✅ aligné avec router { status, solution }
        const res = await api.get(`/solution/${id}`);
        const sol = res.solution;

        setName(sol?.name || "");
        setDescription(sol?.description || "");
        setContent(sol?.content || "");
        setStatus(sol?.status || "DRAFT");
        setIdCompany(sol?.id_company || null);

        const compRes = await api.get("/company/list");
        setCompanies(compRes.companies || []);

      } catch (e) {

        console.error("Erreur chargement solution", e);
        alert("❌ Erreur chargement solution");

      } finally {

        setLoading(false);

      }

    }

    load();

  }, [id]);

  /* ---------------------------------------------------------
     SAVE
  --------------------------------------------------------- */
  async function save() {

    try {

      setSaving(true);

      await api.put(`/solution/update/${id}`, {
        name,
        description: description || null,
        content,
        status,
        id_company: idCompany || null,
      });

      alert("Solution mise à jour");

    } catch (e) {

      console.error(e);
      alert("❌ Erreur mise à jour");

    } finally {

      setSaving(false);

    }

  }

  if (loading) return <p>Chargement…</p>;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">

      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modifier solution
        </h1>
        <Link href="/admin/solution" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la solution"
      />

      <select
        className="border p-2 rounded w-full"
        value={idCompany || ""}
        onChange={(e) =>
          setIdCompany(e.target.value || null)
        }
      >
        <option value="">— Aucune société —</option>
        {companies.map((c) => (
          <option key={c.id_company} value={c.id_company}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        className="border p-2 w-full rounded h-24"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        placeholder="Description"
      />

      <HtmlEditor value={content} onChange={setContent} />

      <select
        className="border p-2 rounded"
        value={status}
        onChange={(e) =>
          setStatus(
            e.target.value as "DRAFT" | "PUBLISHED"
          )
        }
      >
        <option value="DRAFT">DRAFT</option>
        <option value="PUBLISHED">PUBLISHED</option>
      </select>

      <button
        onClick={save}
        disabled={saving}
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>

    </div>
  );
}
