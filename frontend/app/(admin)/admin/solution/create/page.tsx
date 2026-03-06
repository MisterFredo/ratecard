"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Company = {
  id_company: string;
  name: string;
};

export default function CreateSolution() {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [idCompany, setIdCompany] =
    useState<string | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await api.get("/company/list");
        setCompanies(res.companies || []);
      } catch (e) {
        console.error("Erreur chargement sociétés", e);
        setCompanies([]);
      }
    }
    loadCompanies();
  }, []);

  async function save() {

    if (!name.trim()) return alert("Nom requis");
    if (!content.trim()) return alert("Contenu requis");

    try {

      setLoading(true);

      await api.post("/solution/create", {
        name,
        description: description || null,
        content,
        status,
        id_company: idCompany || null,
      });

      alert("Solution créée");

      setName("");
      setDescription("");
      setContent("");
      setStatus("DRAFT");
      setIdCompany(null);

    } catch (e) {

      console.error(e);
      alert("❌ Erreur création");

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="space-y-10">

      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">
          Ajouter une solution
        </h1>
        <Link href="/admin/solution" className="underline">
          ← Retour
        </Link>
      </div>

      <input
        className="border p-2 w-full rounded"
        placeholder="Nom de la solution"
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
        <option value="">
          — Aucune société associée —
        </option>
        {companies.map((c) => (
          <option key={c.id_company} value={c.id_company}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        className="border p-2 w-full rounded h-24"
        placeholder="Description courte"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <HtmlEditor value={content} onChange={setContent} />

      <select
        className="border p-2 rounded w-full max-w-xs"
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
        disabled={loading}
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {loading ? "Création…" : "Créer"}
      </button>

    </div>
  );
}
