// frontend/app/admin/person/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function PersonList() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get("/person/list");
      setPersons(res.persons || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Intervenants</h1>

        <Link
          href="/admin/person/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Ajouter un intervenant
        </Link>
      </div>

      {loading && <div className="text-gray-500">Chargement…</div>}

      {!loading && persons.length === 0 && (
        <div className="border p-6 rounded text-gray-500">
          Aucun intervenant enregistré.
        </div>
      )}

      {!loading && persons.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Fonction</th>
              <th className="p-2 text-left">Société</th>
              <th className="p-2 text-left">LinkedIn</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {persons.map((p) => (
              <tr key={p.ID_PERSON} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.NAME}</td>
                <td className="p-2">{p.TITLE || "—"}</td>
                <td className="p-2">{p.ID_COMPANY || "—"}</td>

                <td className="p-2">
                  {p.LINKEDIN_URL ? (
                    <a href={p.LINKEDIN_URL} target="_blank" className="text-blue-600 underline">
                      Profil
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2">
                  <Link
                    href={`/admin/person/edit/${p.ID_PERSON}`}
                    className="text-blue-600 underline"
                  >
                    Modifier
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
