"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS_BASE_URL = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type ContentLite = {
  ID_CONTENT: string;
  ANGLE_TITLE: string;
  EXCERPT?: string | null;
  STATUS: string;
  CREATED_AT?: string | null;
  MEDIA_RECTANGLE_ID?: string | null;
  MEDIA_SQUARE_ID?: string | null;
};

export default function ContentListPage() {
  const [contents, setContents] = useState<ContentLite[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD CONTENTS
  --------------------------------------------------------- */
  async function load() {
    setLoading(true);

    try {
      const res = await api.get("/content/list");
      const list: ContentLite[] = res.contents || [];

      const enriched = list.map((c) => {
        const rectUrl = c.MEDIA_RECTANGLE_ID
          ? `${GCS_BASE_URL}/content/${c.MEDIA_RECTANGLE_ID}`
          : null;

        const squareUrl = c.MEDIA_SQUARE_ID
          ? `${GCS_BASE_URL}/content/${c.MEDIA_SQUARE_ID}`
          : null;

        return {
          ...c,
          rectUrl,
          squareUrl,
        };
      });

      setContents(enriched);
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
            <th className="p-2">Visuel</th>
            <th className="p-2">Angle</th>
            <th className="p-2">Accroche</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Créé le</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {contents.map((c: any) => (
            <tr
              key={c.ID_CONTENT}
              className="border-b hover:bg-gray-50 transition"
            >
              {/* VISUEL */}
              <td className="p-2">
                {c.rectUrl ? (
                  <img
                    src={c.rectUrl}
                    className="h-12 w-auto rounded border shadow-sm bg-white object-contain"
                  />
                ) : c.squareUrl ? (
                  <img
                    src={c.squareUrl}
                    className="h-12 w-12 rounded border shadow-sm bg-white object-cover"
                  />
                ) : (
                  <span className="text-gray-400 italic">—</span>
                )}
              </td>

              {/* ANGLE */}
              <td className="p-2 font-medium">
                {c.ANGLE_TITLE}
              </td>

              {/* EXCERPT */}
              <td className="p-2 text-gray-600">
                {c.EXCERPT || "—"}
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

              {/* DATE */}
              <td className="p-2">
                {c.CREATED_AT
                  ? new Date(c.CREATED_AT).toLocaleDateString("fr-FR")
                  : "—"}
              </td>

              {/* ACTIONS */}
              <td className="p-2 text-right space-x-3">
                <Link
                  href={`/admin/content/edit/${c.ID_CONTENT}`}
                  className="text-ratecard-blue hover:underline"
                >
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
