"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CompanyList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/company/list");
    setCompanies(res.companies || []);
    setLoading(false);
  }

  useEffect(() => {
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
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          + Ajouter une société
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY */}
      {!loading && companies.length === 0 && (
        <div className="border p-6 rounded text-gray-500 italic">
          Aucune société enregistrée.
        </div>
      )}

      {/* TABLE */}
      {!loading && companies.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-gray-700">
              <th className="p-2">Nom</th>
              <th className="p-2">Logo rectangle</th>
              <th className="p-2">Logo carré</th>
              <th className="p-2">LinkedIn</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr
                key={c.ID_COMPANY}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* NOM */}
                <td className="p-2 font-medium">{c.NAME}</td>

                {/* LOGO RECTANGLE */}
                <td className="p-2">
                  {c.LOGO_URL ? (
                    <img
                      src={c.LOGO_URL}
                      alt="logo"
                      className="h-10 w-auto object-contain border rounded bg-white p-1 shadow-sm"
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
                      alt="logo carré"
                      className="h-10 w-10 object-cover border rounded bg-white shadow-sm"
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
                      className="text-blue-600 hover:text-blue-800 underline"
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
                    className="text-ratecard-blue hover:underline"
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


