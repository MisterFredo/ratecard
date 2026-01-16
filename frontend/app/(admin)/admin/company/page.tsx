"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type CompanyRow = {
  ID_COMPANY: string;
  NAME: string;

  // 🔑 UN SEUL VISUEL
  MEDIA_LOGO_RECTANGLE_ID?: string | null;

  // PARTENAIRE
  IS_PARTNER?: boolean | null;
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
        <p className="italic text-gray-500">
          Aucune société.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Nom</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Visuel (16:9)</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => {
              const rectUrl = c.MEDIA_LOGO_RECTANGLE_ID
                ? `${GCS}/companies/COMPANY_${c.ID_COMPANY}_rect.jpg`
                : null;

              const isPartner = Boolean(c.IS_PARTNER);

              return (
                <tr
                  key={c.ID_COMPANY}
                  className="border-b hover:bg-gray-50"
                >
                  {/* NOM */}
                  <td className="p-2 font-medium">
                    {c.NAME}
                  </td>

                  {/* STATUT PARTENAIRE */}
                  <td className="p-2">
                    {isPartner ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Partenaire
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        Non partenaire
                      </span>
                    )}
                  </td>

                  {/* VISUEL RECTANGLE */}
                  <td className="p-2">
                    {rectUrl ? (
                      <img
                        src={rectUrl}
                        className="h-10 border rounded object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        —
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
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
