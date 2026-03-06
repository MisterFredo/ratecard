"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Confirmer la suppression de cette source ?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await api.delete(`/source/${id}`);
      setSources((prev) =>
        prev.filter((s) => s.source_id !== id)
      );
    } catch (e) {
      console.error(e);
      alert("Erreur suppression source");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Sources
        </h1>

        <Link
          href="/admin/source/create"
          className="bg-ratecard-blue text-white px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          + Ajouter une source
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Domaine</th>
              <th className="text-left px-4 py-3">Auteur</th>
              <th className="text-center px-4 py-3 w-20">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {sources.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  Aucune source enregistrée
                </td>
              </tr>
            )}

            {sources.map((s) => (
              <tr key={s.source_id} className="hover:bg-gray-50 transition">

                <td className="px-4 py-3 font-medium">
                  {s.name}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.type_source || "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.domain || "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.author || "—"}
                </td>

                <td className="px-4 py-3 text-center space-x-2">

                  <Link
                    href={`/admin/source/${s.source_id}`}
                    className="inline-flex items-center text-gray-500 hover:text-black transition"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    onClick={() => handleDelete(s.source_id)}
                    disabled={deletingId === s.source_id}
                    className="inline-flex items-center text-red-500 hover:text-red-700 transition disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
