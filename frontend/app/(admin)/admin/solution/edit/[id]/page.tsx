"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import HtmlEditor from "@/components/admin/HtmlEditor";

type Company = {
  ID_COMPANY: string;
  NAME: string;
};

export default function EditSolution({ params }: { params: { id: string } }) {
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [NAME, setNAME] = useState("");
  const [DESCRIPTION, setDESCRIPTION] = useState("");
  const [CONTENT, setCONTENT] = useState("");
  const [STATUS, setSTATUS] =
    useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [ID_COMPANY, setID_COMPANY] =
    useState<string | null>(null);

  const [COMPANIES, setCOMPANIES] = useState<Company[]>([]);

  useEffect(() => {
    async function load() {
      const solRes = await api.get(`/solution/${id}`);
      const sol = solRes.SOLUTION;

      setNAME(sol.NAME);
      setDESCRIPTION(sol.DESCRIPTION || "");
      setCONTENT(sol.CONTENT);
      setSTATUS(sol.STATUS);
      setID_COMPANY(sol.ID_COMPANY || null);

      const compRes = await api.get("/company/list");
      setCOMPANIES(compRes.COMPANIES || []);

      setLoading(false);
    }

    load();
  }, [id]);

  async function save() {
    try {
      setSaving(true);

      await api.put(`/solution/update/${id}`, {
        NAME,
        DESCRIPTION,
        CONTENT,
        STATUS,
        ID_COMPANY,
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
        value={NAME}
        onChange={(e) => setNAME(e.target.value)}
      />

      <select
        className="border p-2 rounded w-full"
        value={ID_COMPANY || ""}
        onChange={(e) =>
          setID_COMPANY(e.target.value || null)
        }
      >
        <option value="">— Aucune société —</option>
        {COMPANIES.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>

      <textarea
        className="border p-2 w-full rounded h-24"
        value={DESCRIPTION}
        onChange={(e) =>
          setDESCRIPTION(e.target.value)
        }
      />

      <HtmlEditor value={CONTENT} onChange={setCONTENT} />

      <select
        className="border p-2 rounded"
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
        className="bg-ratecard-blue px-6 py-2 text-white rounded"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
