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
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Sociétés
        </h1>

        <Link
          href="/admin/company/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          + Ajouter une société
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY STATE */}
      {!loading && companies.length === 0 && (
        <div className="border p-6 rounded text-gray-500">
          Aucune société enregistrée.
        </div>
      )}

      {/* TABLE */}
      {!loading && companies.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-sm text-gray-700">
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Logo rectangle</th>
              <th className="p-2 text-left">Logo carré</th>
              <th className="p-2 text-left">LinkedIn</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr key={c.ID_COMPANY} className="border-b hover:bg-gray-50">
                
                {/* NOM */}
                <td className="p-2 font-medium">{c.NAME}</td>

                {/* LOGO RECTANGLE */}
                <td className="p-2">
                  {c.LOGO_URL ? (
                    <img
                      src={c.LOGO_URL}
                      className="h-10 w-auto object-contain border rounded bg-white p-1"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* LOGO CARRÉ */}
                <td className="p-2">
                  {c.LOGO_SQUARE_URL ? (
                    <img
                      src={c.LOGO_SQUARE_URL}
                      className="h-10 w-10 object-cover border rounded bg-white"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* LINKEDIN */}
                <td className="p-2">
                  {c.LINKEDIN_URL ? (
                    <a
                      href={c.LINKEDIN_URL}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Profil
                    </a>
                  ) : (
                    "—"
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-2 text-right">
                  <Link
                    href={`/admin/company/edit/${c.ID_COMPANY}`}
                    className="text-ratecard-blue underline"
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

