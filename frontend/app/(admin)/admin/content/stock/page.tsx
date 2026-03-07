"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Play } from "lucide-react";

type RawItem = {
  id_raw: string;
  source_id: string;
  source_title: string;
  date_source?: string | null;
  status: string;
  created_at: string;
};

export default function ContentStockPage() {
  const [raws, setRaws] = useState<RawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/content/raw/stock");
      setRaws(res.raws || []);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement stock");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // =========================
  // DESTOCK BATCH
  // =========================

  async function handleDestockBatch() {
    const confirmRun = window.confirm(
      "Générer les 10 plus anciens contenus en stock ?"
    );

    if (!confirmRun) return;

    setProcessing(true);

    try {
      await api.post("/content/raw/destock", { limit: 10 });
      await load();
    } catch (e) {
      console.error(e);
      alert("Erreur déstockage");
    }

    setProcessing(false);
  }

  // =========================
  // DESTOCK ONE
  // =========================

  async function handleDestockOne(id: string) {
    const confirmRun = window.confirm(
      "Générer ce contenu ?"
    );

    if (!confirmRun) return;

    setProcessing(true);

    try {
      await api.post("/content/raw/destock", { limit: 1 });
      await load();
    } catch (e) {
      console.error(e);
      alert("Erreur déstockage");
    }

    setProcessing(false);
  }

  // =========================
  // DELETE RAW
  // =========================

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Supprimer définitivement cette source stockée ?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await api.delete(`/content/raw/delete/${id}`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  if (loading) return <div>Chargement…</div>;

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Stock des sources
        </h1>

        <button
          onClick={handleDestockBatch}
          disabled={processing}
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          {processing ? "Traitement..." : "Déstocker les 10 plus anciens"}
        </button>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Titre source</th>
            <th className="p-2">Date source</th>
            <th className="p-2">Créé le</th>
            <th className="p-2">Statut</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {raws.map((r) => (
            <tr
              key={r.id_raw}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-2 font-medium">
                {r.source_title}
              </td>

              <td className="p-2 text-gray-600">
                {formatDate(r.date_source)}
              </td>

              <td className="p-2 text-gray-600">
                {formatDate(r.created_at)}
              </td>

              <td className="p-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                  {r.status}
                </span>
              </td>

              <td className="p-2 text-right space-x-3">

                <button
                  onClick={() => handleDestockOne(r.id_raw)}
                  className="inline-flex items-center text-green-600 hover:text-green-800"
                >
                  <Play size={16} />
                </button>

                <button
                  onClick={() => handleDelete(r.id_raw)}
                  disabled={deletingId === r.id_raw}
                  className="inline-flex items-center text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
