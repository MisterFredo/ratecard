"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type CompanyRow = {
  ID_COMPANY: string;
  NAME: string;
  MEDIA_LOGO_SQUARE_ID?: string | null;
  MEDIA_LOGO_RECTANGLE_ID?: string | null;
};

export default function CompanyList() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // LOAD
  // ---------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/company/list");
        const rows: CompanyRow[] = res.companies || [];

        setCompanies(rows);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement sociétés");
      }

      setLoading(false);
    }

    load();
  }, []);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Sociétés
        </h1>

        <Link
          href="/admin/company/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter une société
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : companies.length === 0 ? (
        <p className="italic text-gray-500">Aucune société.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Nom</th>
              <th className="p-2">Logo carré</th>
              <th className="p-2">Logo rectangle</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => {
              const squareUrl = c.MEDIA_LOGO_SQUARE_ID
                ? `${GCS}/companies/COMPANY_${c.ID_COMPANY}_square.jpg`
                : null;

              const rectUrl = c.MEDIA_LOGO_RECTANGLE_ID
                ? `${GCS}/companies/COMPANY_${c.ID_COMPANY}_rect.jpg`
                : null;

              return (
                <tr
                  key={c.ID_COMPANY}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-2">{c.NAME}</td>

                  <td className="p-2">
                    {squareUrl ? (
                      <img
                        src={squareUrl}
                        className="w-12 h-12 rounded border object-cover"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-2">
                    {rectUrl ? (
                      <img
                        src={rectUrl}
                        className="h-10 border rounded"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-2 text-right">
                    <Link
                      href={`/admin/company/edit/${c.ID_COMPANY}`}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
