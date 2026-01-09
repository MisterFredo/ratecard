"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type PersonRow = {
  ID_PERSON: string;
  NAME: string;
  COMPANY_NAME?: string | null;
  MEDIA_PICTURE_SQUARE_ID?: string | null;
  MEDIA_PICTURE_RECTANGLE_ID?: string | null;
};

export default function PersonList() {
  const [persons, setPersons] = useState<PersonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/person/list");
        setPersons(res.persons || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement personnes");
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">Personnes</h1>
        <Link
          href="/admin/person/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter une personne
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : persons.length === 0 ? (
        <p className="italic text-gray-500">Aucune personne.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Nom</th>
              <th className="p-2">Société</th>
              <th className="p-2">Carré</th>
              <th className="p-2">Rectangle</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => {
              const squareUrl = p.MEDIA_PICTURE_SQUARE_ID
                ? `${GCS}/persons/PERSON_${p.ID_PERSON}_square.jpg`
                : null;

              const rectUrl = p.MEDIA_PICTURE_RECTANGLE_ID
                ? `${GCS}/persons/PERSON_${p.ID_PERSON}_rect.jpg`
                : null;

              return (
                <tr key={p.ID_PERSON} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{p.NAME}</td>

                  <td className="p-2 text-gray-700">
                    {p.COMPANY_NAME || "—"}
                  </td>

                  <td className="p-2">
                    {squareUrl ? (
                      <img
                        src={squareUrl}
                        className="w-12 h-12 border rounded object-cover"
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
                      href={`/admin/person/edit/${p.ID_PERSON}`}
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
