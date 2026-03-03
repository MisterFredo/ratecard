"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Company = {
  ID_COMPANY: string;
  NAME: string;
};

export default function CreateSolution() {
  const [NAME, setNAME] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [CONTENT, setCONTENT] = useState("");
  const [STATUS, setSTATUS] =
    useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [ID_COMPANY, setID_COMPANY] =
    useState<string | null>(null);

  const [COMPANIES, setCOMPANIES] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCompanies() {
      const res = await api.get("/company/list");
      setCOMPANIES(res.COMPANIES || []);
    }
    loadCompanies();
  }, []);

  async function save() {
    if (!NAME.trim()) return alert("Nom requis");
    if (!CONTENT.trim()) return alert("Contenu requis");

    try {
      setLoading(true);

      await api.post("/solution/create", {
        NAME,
        DESCRIPTION: DESCRIPTION || null,
        CONTENT,
        STATUS,
        ID_COMPANY,
      });

      alert("Solution créée");

      setNAME("");
      setDESCRIPTION("");
      setCONTENT("");
      setSTATUS("DRAFT");
      setID_COMPANY(null);
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

      {/* NAME */}
      <input
        className="border p-2 w-full rounded"
        placeholder="Nom de la solution"
        value={NAME}
        onChange={(e) => setNAME(e.target.value)}
      />

      {/* COMPANY */}
      <select
        className="border p-2 rounded w-full"
        value={ID_COMPANY || ""}
        onChange={(e) =>
          setID_COMPANY(e.target.value || null)
        }
      >
        <option value="">
          — Aucune société associée —
        </option>
        {COMPANIES.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>

      {/* DESCRIPTION */}
      <textarea
        className="border p-2 w-full rounded h-24"
        placeholder="Description courte"
        value={DESCRIPTION}
        onChange={(e) =>
          setDESCRIPTION(e.target.value)
        }
      />

      {/* CONTENT */}
      <HtmlEditor value={CONTENT} onChange={setCONTENT} />

      {/* STATUS */}
      <select
        className="border p-2 rounded w-full max-w-xs"
        value={STATUS}
        onChange={(e) =>
          setSTATUS(
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
