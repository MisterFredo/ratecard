"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type ModelRow = {
  id_model: string;
  name: string;
  topic_ids: string[];
  company_ids: string[];
};

export default function SynthesisModelsPage() {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/synthesis/models");
        setModels(res.models || []);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement modèles de synthèse");
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-3xl font-semibold">
          Modèles de synthèse
        </h1>

        <Link
          href="/admin/synthesis/models/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter un modèle
        </Link>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : models.length === 0 ? (
        <p className="italic text-gray-500">
          Aucun modèle défini.
        </p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Nom</th>
              <th className="p-2">Topics</th>
              <th className="p-2">Sociétés</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr
                key={m.id_model}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-2 font-medium">
                  {m.name}
                </td>

                <td className="p-2">
                  {m.topic_ids?.length ?? 0}
                </td>

                <td className="p-2">
                  {m.company_ids?.length ?? 0}
                </td>

                <td className="p-2 text-right">
                  <Link
                    href={`/admin/synthesis/models/edit/${m.id_model}`}
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
