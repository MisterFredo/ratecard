"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AxesList() {
  const [axes, setAxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/axes/list");
    setAxes(res.axes || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cet axe ?")) return;
    await api.delete(`/axes/${id}`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Axes éditoriaux
        </h1>

        <Link
          href="/admin/axes/create"
          className="bg-ratecard-green px-4 py-2 rounded text-white shadow hover:bg-green-600 transition"
        >
          + Ajouter un axe
        </Link>
      </div>

      {/* LOADING */}
      {loading && <div className="text-gray-500">Chargement…</div>}

      {/* EMPTY */}
      {!loading && axes.length === 0 && (
        <p className="text-gray-500 italic">Aucun axe n’a encore été créé.</p>
      )}

      {/* TABLE */}
      {!loading && axes.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Type</th>
              <th className="p-2">Label</th>
              <th className="p-2">Visuel</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {axes.map((a) => (
              <tr key={a.ID_AXE} className="border-b hover:bg-gray-50 transition">
                
                {/* TYPE */}
                <td className="p-2">
                  <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                    {a.TYPE}
                  </span>
                </td>

                {/* LABEL */}
                <td className="p-2 font-medium">{a.LABEL}</td>

                {/* VISUEL */}
                <td className="p-2">
                  {a.VISUEL_SQUARE_URL ? (
                    <img
                      src={a.VISUEL_SQUARE_URL}
                      className="w-10 h-10 rounded border object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-2 flex gap-3 justify-end">

                  <Link
                    href={`/admin/axes/edit/${a.ID_AXE}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Modifier
                  </Link>

                  <button
                    onClick={() => remove(a.ID_AXE)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
