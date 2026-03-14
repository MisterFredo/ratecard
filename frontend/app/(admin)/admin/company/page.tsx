"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;
const COMPANY_MEDIA_PATH = "companies";

type CompanyRow = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
  is_partner?: boolean | null;
  has_description?: boolean;
  has_wiki?: boolean;
};

export default function CompanyList() {

  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/company/list");
        setCompanies(res.companies || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement sociétés");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function deleteCompany(id: string, name: string) {

    const ok = confirm(`Supprimer la société "${name}" ?`);
    if (!ok) return;

    try {

      await api.delete(`/company/${id}`);

      setCompanies((prev) =>
        prev.filter((c) => c.id_company !== id)
      );

    } catch (e) {

      console.error(e);
      alert("❌ Erreur suppression");

    }

  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
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

      {/* SEARCH */}

      <div>
        <input
          type="text"
          placeholder="Rechercher une société..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : filteredCompanies.length === 0 ? (
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

            {filteredCompanies.map((c) => {

              const rectUrl = c.media_logo_rectangle_id
                ? `${GCS_BASE_URL}/${COMPANY_MEDIA_PATH}/${c.media_logo_rectangle_id}`
                : null;

              return (

                <tr
                  key={c.id_company}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-2 font-medium">
                    {c.name}
                  </td>

                  <td className="p-2">
                    {c.is_partner ? (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                        Partenaire
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        Non partenaire
                      </span>
                    )}
                  </td>

                  <td className="p-2">
                    {c.has_description ? (
                      <span className="text-green-600 font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

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

                  <td className="p-2 text-right space-x-3">

                    <Link
                      href={`/admin/company/edit/${c.id_company}`}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </Link>

                    <button
                      onClick={() => deleteCompany(c.id_company, c.name)}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>

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
