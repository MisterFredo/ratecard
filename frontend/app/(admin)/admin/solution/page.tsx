"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

type Solution = {
  id_solution: string;
  name: string;
  company_name?: string | null;
  status: string;
};

export default function SolutionList() {

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/solution/list");
        setSolutions(res.solutions || []);
      } catch (e) {
        console.error("Erreur chargement solutions", e);
        setSolutions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Confirmer la suppression de cette solution ?\n\nAction irréversible."
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await api.delete(`/solution/${id}`);

      setSolutions((prev) =>
        prev.filter((s) => s.id_solution !== id)
      );

    } catch (e) {
      console.error("Erreur suppression solution", e);
      alert("❌ Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Solutions</h1>
        <Link
          href="/admin/solution/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter
        </Link>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Société</th>
              <th className="p-3">Statut</th>
              <th className="p-3 w-28 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {solutions.map((s) => (
              <tr key={s.id_solution} className="border-t hover:bg-gray-50">

                <td className="p-3 font-medium">{s.name}</td>

                <td className="p-3">
                  {s.company_name ? (
                    s.company_name
                  ) : (
                    <span className="text-red-600 text-xs">
                      ⚠ Non associée
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      s.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>

                <td className="p-3 flex justify-end items-center gap-3">
                  <Link
                    href={`/admin/solution/edit/${s.id_solution}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    onClick={() => handleDelete(s.id_solution)}
                    disabled={deletingId === s.id_solution}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>

              </tr>
            ))}

            {solutions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400"
                >
                  Aucune solution trouvée
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}
