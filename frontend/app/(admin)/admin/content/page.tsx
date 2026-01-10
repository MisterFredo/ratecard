"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Pencil } from "lucide-react";

type ContentLite = {
  ID_CONTENT: string;
  TITLE: string;
  EVENT_LABEL?: string | null;
  STATUS: string;
  PUBLISHED_AT?: string | null;
};

export default function ContentListPage() {
  const [contents, setContents] = useState<ContentLite[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD CONTENTS (ADMIN)
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/content/list");
      setContents(res.contents || []);
    } catch (e) {
      console.error(e);
      alert("Erreur chargement contenus");
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Chargement…</div>;

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-ratecard-blue">
          Contenus
        </h1>

        <Link
          href="/admin/content/create"
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Nouveau contenu
        </Link>
      </div>

      {/* TABLE */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b text-left text-gray-700">
            <th className="p-2">Titre</th>
            <th className="p-2">Événement</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Publié le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {contents.map((c) => (
            <tr
              key={c.ID_CONTENT}
              className="border-b hover:bg-gray-50 transition"
            >
              {/* TITRE */}
              <td className="p-2 font-medium">
                {c.TITLE}
              </td>

              {/* EVENT */}
              <td className="p-2 text-gray-600">
                {c.EVENT_LABEL || "—"}
              </td>

              {/* STATUS */}
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    c.STATUS === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : c.STATUS === "DRAFT"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {c.STATUS}
                </span>
              </td>

              {/* DATE DE PUBLICATION */}
              <td className="p-2">
                {c.PUBLISHED_AT
                  ? new Date(c.PUBLISHED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right">
                <Link
                  href={`/admin/content/edit/${c.ID_CONTENT}`}
                  className="inline-flex items-center gap-1 text-ratecard-blue hover:text-ratecard-blue/80"
                  title="Modifier le contenu"
                >
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
