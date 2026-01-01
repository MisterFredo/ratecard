"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function PersonList() {
  const [persons, setPersons] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1️⃣ People
      const res = await api.get("/person/list");
      const list = res.persons || [];

      // 2️⃣ Map sociétés
      const resCompanies = await api.get("/company/list");
      const map: Record<string, string> = {};
      (resCompanies.companies || []).forEach((c: any) => {
        map[c.ID_COMPANY] = c.NAME;
      });
      setCompanies(map);

      // 3️⃣ Ajout URLs visuels GCS
      const enriched = list.map((p: any) => {
        const squareUrl = p.MEDIA_PICTURE_SQUARE_ID
          ? `${GCS}/persons/PERSON_${p.ID_PERSON}_square.jpg`
          : null;

        const rectUrl = p.MEDIA_PICTURE_RECTANGLE_ID
          ? `${GCS}/persons/PERSON_${p.ID_PERSON}_rect.jpg`
          : null;

        return { ...p, squareUrl, rectUrl };
      });

      setPersons(enriched);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Intervenants
        </h1>

        <Link
          href="/admin/person/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Ajouter
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : persons.length === 0 ? (
        <p className="italic text-gray-500">Aucun intervenant.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Portrait</th>
              <th className="p-2">Nom</th>
              <th className="p-2">Fonction</th>
              <th className="p-2">Société</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {persons.map((p) => (
              <tr key={p.ID_PERSON} className="border-b hover:bg-gray-50">
                {/* Portrait carré prioritaire */}
                <td className="p-2">
                  {p.squareUrl ? (
                    <img
                      src={p.squareUrl}
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : p.rectUrl ? (
                    <img
                      src={p.rectUrl}
                      className="h-12 rounded object-cover border"
                    />
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2 font-medium">{p.NAME}</td>
                <td className="p-2">{p.TITLE || "—"}</td>
                <td className="p-2">
                  {p.ID_COMPANY ? companies[p.ID_COMPANY] : "—"}
                </td>

                <td className="p-2 text-right">
                  <Link
                    href={`/admin/person/edit/${p.ID_PERSON}`}
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
