"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type ConceptRow = {
  ID_CONCEPT: string;
  TITLE: string;
  STATUS: "DRAFT" | "PUBLISHED";
  VECTORISE?: boolean;
  UPDATED_AT?: string;
};

export default function ConceptList() {
  const [loading, setLoading] = useState(true);
  const [concepts, setConcepts] = useState<ConceptRow[]>([]);

  /* ---------------------------------------------------------
     LOAD
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/concept/list");
        setConcepts(res.concepts || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement concepts");
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p>Chargement…</p>;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Concepts
        </h1>

        <Link
          href="/admin/concept/create"
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          + Nouveau concept
        </Link>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Titre</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Vectorisé</th>
              <th className="p-3">Mis à jour</th>
              <th className="p-3 w-16"></th>
            </tr>
          </thead>

          <tbody>
            {concepts.map((c) => (
              <tr
                key={c.ID_CONCEPT}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {c.TITLE}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.STATUS === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.STATUS}
                  </span>
                </td>

                <td className="p-3">
                  {c.VECTORISE ? (
                    <span className="text-green-600">
                      ✔
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      —
                    </span>
                  )}
                </td>

                <td className="p-3 text-gray-500">
                  {c.UPDATED_AT
                    ? new Date(c.UPDATED_AT).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  <Link
                    href={`/admin/concept/edit/${c.ID_CONCEPT}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
