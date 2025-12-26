"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function PersonList() {
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any>({});
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD DATA (persons + companies mapping)
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load persons
      const res = await api.get("/person/list");
      setPersons(res.persons || []);

      // Load companies for readable mapping
      const resCompanies = await api.get("/company/list");
      const map: any = {};
      (resCompanies.companies || []).forEach((c: any) => {
        map[c.ID_COMPANY] = c.NAME;
      });
      setCompanies(map);

      setLoading(false);
    }

    load();
  }, []);

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Intervenants
        </h1>

        <Link
          href="/admin/person/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          + Ajouter un intervenant
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY */}
      {!loading && persons.length === 0 && (
        <div className="border p-6 rounded text-gray-500 italic">
          Aucun intervenant enregistré pour le moment.
        </div>
      )}

      {/* TABLE */}
      {!loading && persons.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left text-gray-700">
              <th className="p-2">Nom</th>
              <th className="p-2">Fonction</th>
              <th className="p-2">Société</th>
              <th className="p-2">LinkedIn</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {persons.map((p) => (
              <tr
                key={p.ID_PERSON}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* NOM */}
                <td className="p-2 font-medium">{p.NAME}</td>

                {/* FONCTION */}
                <td className="p-2 text-gray-700">
                  {p.TITLE || "—"}
                </td>

                {/* SOCIETE (mapping ID → NAME) */}
                <td className="p-2">
                  {p.ID_COMPANY
                    ? companies[p.ID_COMPANY] || p.ID_COMPANY
                    : "—"}
                </td>

                {/* LINKEDIN */}
                <td className="p-2">
                  {p.LINKEDIN_URL ? (
                    <a
                      href={p.LINKEDIN_URL}
                      target="_blank"
                      className="text-blue-600 hover:underline"
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
                    href={`/admin/person/edit/${p.ID_PERSON}`}
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

