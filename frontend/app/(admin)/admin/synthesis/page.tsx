"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type SynthesisLite = {
  ID_SYNTHESIS: string;
  NAME: string;
  TYPE: string;
  DATE_FROM?: string | null;
  DATE_TO?: string | null;
  STATUS: string;
  CREATED_AT?: string | null;
};

export default function SynthesisListPage() {
  const [syntheses, setSyntheses] = useState<SynthesisLite[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD SYNTHESES (ADMIN)
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/synthesis/list");
      setSyntheses(res.syntheses || []);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement synthèses");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Synthèses
        </h1>

        <Link
          href="/admin/synthesis/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouvelle synthèse
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Nom</th>
            <th className="p-2">Type</th>
            <th className="p-2">Période</th>
            <th className="p-2">Statut</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {syntheses.map((s) => (
            <tr
              key={s.ID_SYNTHESIS}
              className="border-b hover:bg-gray-50 transition"
            >
              {/* NOM */}
              <td className="p-2 font-medium">
                {s.NAME}
              </td>

              {/* TYPE */}
              <td className="p-2">
                <span className="text-xs font-medium">
                  {s.TYPE}
                </span>
              </td>

              {/* PERIODE */}
              <td className="p-2 text-gray-600">
                {s.DATE_FROM && s.DATE_TO
                  ? `${new Date(
                      s.DATE_FROM
                    ).toLocaleDateString("fr-FR")} → ${new Date(
                      s.DATE_TO
                    ).toLocaleDateString("fr-FR")}`
                  : "—"}
              </td>

              {/* STATUS */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    s.STATUS === "READY"
                      ? "bg-green-100 text-green-700"
                      : s.STATUS === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s.STATUS}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right">
                <Link
                  href={`/admin/synthesis/edit/${s.ID_SYNTHESIS}`}
                  className="inline-flex items-center gap-1 text-ratecard-blue hover:text-ratecard-blue/80"
                  title="Modifier la synthèse"
                >
                  <Pencil size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
