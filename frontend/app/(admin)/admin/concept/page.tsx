"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type ConceptRow = {
  id_concept: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED";
  vectorise?: boolean;
  created_at?: string;
  updated_at?: string;
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
      } finally {
        setLoading(false);
      }
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
                key={c.id_concept}
                className="border-t hover:bg-gray-50"
              >
                {/* TITLE */}
                <td className="p-3 font-medium">
                  {c.title}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>

                {/* VECTORISE */}
                <td className="p-3">
                  {c.vectorise ? (
                    <span className="text-green-600">
                      ✔
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      —
                    </span>
                  )}
                </td>

                {/* UPDATED */}
                <td className="p-3 text-gray-500">
                  {c.updated_at
                    ? new Date(c.updated_at).toLocaleDateString()
                    : "-"}
                </td>

                {/* EDIT */}
                <td className="p-3">
                  <Link
                    href={`/admin/concept/edit/${c.id_concept}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </Link>
                </td>
              </tr>
            ))}

            {concepts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-400"
                >
                  Aucun concept trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
