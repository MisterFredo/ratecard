"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil, Trash2 } from "lucide-react";

type ConceptRow = {
  ID_CONCEPT: string;
  TITLE: string;
  STATUS: "DRAFT" | "PUBLISHED";
  VECTORISE?: boolean;
  ID_TOPIC?: string | null;
  UPDATED_AT?: string;
};

type Topic = {
  ID_TOPIC: string;
  LABEL: string;
};

export default function ConceptList() {
  const [loading, setLoading] = useState(true);
  const [concepts, setConcepts] = useState<ConceptRow[]>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD DATA
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const [conceptRes, topicRes] = await Promise.all([
          api.get("/concept/list"),
          api.get("/topic/list"),
        ]);

        setConcepts(conceptRes.concepts || []);

        const map: Record<string, string> = {};
        (topicRes.topics || []).forEach((t: Topic) => {
          map[t.ID_TOPIC] = t.LABEL;
        });

        setTopicsMap(map);
      } catch (e) {
        console.error(e);
        alert("❌ Erreur chargement concepts");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     DELETE
  --------------------------------------------------------- */
  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Confirmer la suppression de ce concept ?\n\nCette action est irréversible."
    );

    if (!confirmDelete) return;

    setDeletingId(id);

    try {
      await api.delete(`/concept/${id}`);

      // Suppression optimiste du state
      setConcepts((prev) =>
        prev.filter((c) => c.ID_CONCEPT !== id)
      );
    } catch (e) {
      console.error(e);
      alert("❌ Erreur suppression concept");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p>Chargement…</p>;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">
          Concepts
        </h1>

        <Link
          href="/admin/concept/create"
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          + Nouveau concept
        </Link>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Titre</th>
              <th className="p-3">Topic</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Vectorisé</th>
              <th className="p-3">Mis à jour</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>

          <tbody>
            {concepts.map((c) => (
              <tr
                key={c.ID_CONCEPT}
                className="border-t hover:bg-gray-50"
              >
                {/* TITLE */}
                <td className="p-3 font-medium">
                  {c.TITLE}
                </td>

                {/* TOPIC */}
                <td className="p-3 text-gray-600">
                  {c.ID_TOPIC
                    ? topicsMap[c.ID_TOPIC] || "—"
                    : "—"}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.STATUS === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.STATUS}
                  </span>
                </td>

                {/* VECTORISE */}
                <td className="p-3">
                  {c.VECTORISE ? (
                    <span className="text-green-600">
                      ✔
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      —
                    </span>
                  )}
                </td>

                {/* UPDATED */}
                <td className="p-3 text-gray-500">
                  {c.UPDATED_AT
                    ? new Date(c.UPDATED_AT).toLocaleDateString()
                    : "-"}
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex items-center gap-3">
                  <Link
                    href={`/admin/concept/edit/${c.ID_CONCEPT}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </Link>

                  <button
                    onClick={() =>
                      handleDelete(c.ID_CONCEPT)
                    }
                    disabled={deletingId === c.ID_CONCEPT}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {concepts.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-400"
                >
                  Aucun concept trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
