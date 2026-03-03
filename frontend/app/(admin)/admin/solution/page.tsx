"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Solution = {
  ID_SOLUTION: string;
  NAME: string;
  COMPANY_NAME?: string | null;
  STATUS: string;
};

export default function SolutionList() {
  const [SOLUTIONS, setSOLUTIONS] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.get("/solution/list");
      setSOLUTIONS(res.SOLUTIONS || []);
      setLoading(false);
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
          {SOLUTIONS.map((s) => (
            <tr key={s.ID_SOLUTION} className="border-b">
              <td className="p-2 font-medium">{s.NAME}</td>

              <td className="p-2">
                {s.COMPANY_NAME ? (
                  s.COMPANY_NAME
                ) : (
                  <span className="text-red-600 text-xs">
                    ⚠ Non associée
                  </span>
                )}
              </td>

              <td className="p-2">{s.STATUS}</td>

              <td className="p-2 text-right">
                <Link
                  href={`/admin/solution/edit/${s.ID_SOLUTION}`}
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
