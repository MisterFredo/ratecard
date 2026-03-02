"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

type CompanyRow = {
  id_company: string;
  name: string;
  media_logo_url?: string | null;
  is_partner?: boolean | null;
  has_description?: boolean;
  has_wiki?: boolean;
};

export default function CompanyList() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const rows: CompanyRow[] = await api.get("/company/list");
        setCompanies(rows || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement sociétés");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
              <th className="p-2">Description</th>
              <th className="p-2">Wiki</th>
              <th className="p-2">Logo</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => {
              const isPartner = Boolean(c.is_partner);

              const rectUrl = c.media_logo_url
                ? `${GCS_BASE_URL}/${COMPANY_MEDIA_PATH}/${c.media_logo_url}`
                : null;

              return (
                <tr
                  key={c.id_company}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-2 font-medium">{c.name}</td>

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

                  {/* DESCRIPTION STATUS */}
                  <td className="p-2">
                    {c.has_description ? (
                      <span className="text-green-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* WIKI STATUS */}
                  <td className="p-2">
                    {c.has_wiki ? (
                      <span className="text-blue-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-2">
                    {rectUrl ? (
                      <img
                        src={rectUrl}
                        alt={`Logo ${c.name}`}
                        className="h-10 max-w-[120px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  <td className="p-2 text-right">
                    <Link
                      href={`/admin/company/edit/${c.id_company}`}
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
