// frontend/app/admin/axes/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AxesList() {
  const [axes, setAxes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api.get("/axes/list");
    setAxes(res.axes || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet axe ?")) return;
    await api.delete(`/axes/${id}`);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Axes éditoriaux</h1>
        <Link href="/admin/axes/create" className="bg-black text-white px-4 py-2 rounded">
          + Ajouter un axe
        </Link>
      </div>

      {loading && <div>Chargement…</div>}

      {!loading && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Label</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {axes.map((a) => (
              <tr key={a.ID_AXE} className="border-b hover:bg-gray-50">
                <td className="p-2">{a.TYPE}</td>
                <td className="p-2">{a.LABEL}</td>
                <td className="p-2">
                  <button onClick={() => remove(a.ID_AXE)} className="text-red-600 underline">
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
