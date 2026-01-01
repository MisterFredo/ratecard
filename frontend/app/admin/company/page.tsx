"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function CompanyList() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await api.get("/company/list");
    const rawCompanies = res.companies || [];

    const enriched = await Promise.all(
      rawCompanies.map(async (c: any) => {
        const sq = c.MEDIA_LOGO_SQUARE_ID
          ? `${GCS_BASE_URL}/companies/COMPANY_${c.ID_COMPANY}_square.jpg`
          : null;

        const rect = c.MEDIA_LOGO_RECTANGLE_ID
          ? `${GCS_BASE_URL}/companies/COMPANY_${c.ID_COMPANY}_rect.jpg`
          : null;

        return { ...c, squareUrl: sq, rectUrl: rect };
      })
    );

    setCompanies(enriched);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold text-ratecard-blue">Sociétés</h1>

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
            {companies.map((c) => (
              <tr key={c.ID_COMPANY} className="border-b hover:bg-gray-50">
                <td className="p-2">{c.NAME}</td>

                <td className="p-2">
                  {c.squareUrl ? (
                    <img src={c.squareUrl} className="w-12 h-12 rounded border" />
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2">
                  {c.rectUrl ? (
                    <img src={c.rectUrl} className="h-10 border rounded" />
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
