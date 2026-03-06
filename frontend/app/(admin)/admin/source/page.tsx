"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type SourceRow = {
  source_id: string;
  name: string;
  type_source?: string | null;
  domain?: string | null;
  author?: string | null;
  created_at?: string;
};

export default function SourceList() {

  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<SourceRow[]>([]);

  useEffect(() => {

    async function load() {

      try {

        const res = await api.get("/source/list");
        setSources(res.sources || []);

      } catch (e) {

        console.error(e);
        alert("Erreur chargement sources");

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-10">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-semibold">
          Sources
        </h1>

        <Link
          href="/admin/source/create"
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          + Ajouter une source
        </Link>

      </div>

      <table className="w-full border">

        <thead className="bg-gray-50">
          <tr>

            <th className="text-left p-3 border">
              Nom
            </th>

            <th className="text-left p-3 border">
              Type
            </th>

            <th className="text-left p-3 border">
              Domaine
            </th>

            <th className="text-left p-3 border">
              Auteur
            </th>

            <th className="text-left p-3 border w-16">
              Edit
            </th>

          </tr>
        </thead>

        <tbody>

          {sources.map((s) => (
            <tr key={s.source_id} className="border-t">

              <td className="p-3 border">
                {s.name}
              </td>

              <td className="p-3 border">
                {s.type_source || "—"}
              </td>

              <td className="p-3 border">
                {s.domain || "—"}
              </td>

              <td className="p-3 border">
                {s.author || "—"}
              </td>

              <td className="p-3 border text-center">

                <Link href={`/admin/source/${s.source_id}`}>
                  <Pencil size={16} />
                </Link>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
