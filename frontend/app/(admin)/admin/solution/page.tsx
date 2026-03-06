"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Solution = {
  id_solution: string;
  name: string;
  company_name?: string | null;
  status: string;
};

export default function SolutionList() {

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/solution/list");
        setSolutions(res.solutions || []);
      } catch (e) {
        console.error("Erreur chargement solutions", e);
        setSolutions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">

      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Solutions</h1>
        <Link
          href="/admin/solution/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter
        </Link>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Nom</th>
            <th className="p-2">Société</th>
            <th className="p-2">Statut</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {solutions.map((s) => (
            <tr key={s.id_solution} className="border-b">

              <td className="p-2 font-medium">{s.name}</td>

              <td className="p-2">
                {s.company_name ? (
                  s.company_name
                ) : (
                  <span className="text-red-600 text-xs">
                    ⚠ Non associée
                  </span>
                )}
              </td>

              <td className="p-2">{s.status}</td>

              <td className="p-2 text-right">
                <Link
                  href={`/admin/solution/edit/${s.id_solution}`}
                  className="text-blue-600 underline"
                >
                  Modifier
                </Link>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}
