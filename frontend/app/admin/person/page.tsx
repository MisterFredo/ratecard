"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function PersonList() {
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD PERSONS + COMPANY MAP + MEDIA (GCS)
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) Persons
      const res = await api.get("/person/list");
      const rawPersons = res.persons || [];

      // 2) Companies map
      const resCompanies = await api.get("/company/list");
      const map: Record<string, string> = {};
      (resCompanies.companies || []).forEach((c: any) => {
        map[c.ID_COMPANY] = c.NAME;
      });
      setCompanies(map);

      // 3) Person → enrich with GCS media
      const enriched = await Promise.all(
        rawPersons.map(async (p: any) => {
          const m = await api.get(
            `/media/by-entity?type=person&id=${p.ID_PERSON}`
          );

          const media = m.media || [];
          const square = media.find((m: any) => m.FORMAT === "square");
          const rect = media.find((m: any) => m.FORMAT === "rectangle");

          return {
            ...p,

            // 🔥 GCS URL DIRECTE
            squareUrl: square ? `${GCS_BASE_URL}/${square.FILEPATH}` : null,
            rectUrl: rect ? `${GCS_BASE_URL}/${rect.FILEPATH}` : null,
          };
        })
      );

      setPersons(enriched);
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
        <h1 className="text-3xl font-semibold text-ratecard-blue">Intervenants</h1>

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
              <th className="p-2">Portrait</th>
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
                {/* PORTRAIT */}
                <td className="p-2">
                  {p.squareUrl ? (
                    <img
                      src={p.squareUrl}
                      alt="portrait"
                      className="h-12 w-12 rounded-full object-cover border shadow-sm bg-white"
                    />
                  ) : p.rectUrl ? (
                    <img
                      src={p.rectUrl}
                      alt="portrait"
                      className="h-12 w-auto rounded border shadow-sm bg-white"
                    />
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>

                {/* NOM */}
                <td className="p-2 font-medium">{p.NAME}</td>

                {/* FONCTION */}
                <td className="p-2 text-gray-700">{p.TITLE || "—"}</td>

                {/* SOCIÉTÉ */}
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



