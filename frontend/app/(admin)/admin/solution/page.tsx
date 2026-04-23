"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type Solution = {
  id_solution: string;
  name: string;
  company_name?: string | null;
  status: string;

  // 🔥 NEW
  media_logo_rectangle_id?: string | null;
  logo_type?: "solution" | "company";
};

export default function SolutionList() {

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  // =====================================================
  // FILTER
  // =====================================================
  const q = search.toLowerCase();

  const filteredSolutions = solutions.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    (s.company_name || "").toLowerCase().includes(q)
  );

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Solutions</h1>
        <Link
          href="/admin/solution/create"
          className="bg-ratecard-green px-4 py-2 text-white rounded"
        >
          + Ajouter
        </Link>
      </div>

      {/* SEARCH */}
      <div>
        <input
          type="text"
          placeholder="Rechercher une solution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-md"
        />
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Société</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Logo</th>
              <th className="p-3 w-28 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSolutions.map((s) => {

              const folder =
                s.logo_type === "solution"
                  ? "solutions"
                  : "companies";

              const rectUrl = s.media_logo_rectangle_id
                ? `${GCS_BASE_URL}/${folder}/${s.media_logo_rectangle_id}`
                : null;

              return (
                <tr
                  key={s.id_solution}
                  className="border-t hover:bg-gray-50"
                >

                  {/* NOM */}
                  <td className="p-3 font-medium">
                    {s.name}
                  </td>

                  {/* COMPANY */}
                  <td className="p-3">
                    {s.company_name ? (
                      s.company_name
                    ) : (
                      <span className="text-red-600 text-xs">
                        ⚠ Non associée
                      </span>
                    )}
                  </td>

                  {/* STATUS */}
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

                  {/* LOGO */}
                  <td className="p-3">
                    {rectUrl ? (
                      <img
                        src={rectUrl}
                        alt={s.name}
                        className="h-8 max-w-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  {/* ACTIONS */}
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
              );
            })}

            {filteredSolutions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
