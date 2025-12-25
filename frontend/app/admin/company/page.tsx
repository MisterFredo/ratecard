// frontend/app/admin/company/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CompanyList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get("/company/list");
      setCompanies(res.companies || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Sociétés</h1>

        <Link href="/admin/company/create" className="bg-black text-white px-4 py-2 rounded">
          + Ajouter une société
        </Link>
      </div>

      {loading && <div>Chargement…</div>}

      {!loading && companies.length === 0 && (
        <div className="border p-6 rounded text-gray-500">Aucune société enregistrée.</div>
      )}

      {!loading && companies.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Logo</th>
              <th className="p-2 text-left">LinkedIn</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr key={c.ID_COMPANY} className="border-b hover:bg-gray-50">
                <td className="p-2">{c.NAME}</td>
                <td className="p-2">
                  {c.LOGO_URL ? (
                    <img src={c.LOGO_URL} className="h-6" />
                  ) : (
                    <span className="text-gray-400 italic">Aucun</span>
                  )}
                </td>
                <td className="p-2">
                  {c.LINKEDIN_URL ? (
                    <a href={c.LINKEDIN_URL} target="_blank" className="text-blue-600 underline">
                      Profil
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2">
                  <Link
                    href={`/admin/company/edit/${c.ID_COMPANY}`}
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
