"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

export default function AxesList() {
  const [axes, setAxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1️⃣ Charger axes
      const res = await api.get("/axes/list");
      const list = res.axes || [];

      // 2️⃣ Ajouter URLs visuels GCS
      const enriched = list.map((a: any) => {
        const squareUrl = a.MEDIA_SQUARE_ID
          ? `${GCS}/axes/AXE_${a.ID_AXE}_square.jpg`
          : null;

        const rectUrl = a.MEDIA_RECTANGLE_ID
          ? `${GCS}/axes/AXE_${a.ID_AXE}_rect.jpg`
          : null;

        return { ...a, squareUrl, rectUrl };
      });

      setAxes(enriched);
      setLoading(false);
    }

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
          className="bg-ratecard-green text-white px-4 py-2 rounded shadow"
        >
          + Ajouter un axe
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-500">Chargement…</p>}

      {/* EMPTY */}
      {!loading && axes.length === 0 && (
        <p className="italic text-gray-500">Aucun axe éditorial.</p>
      )}

      {/* TABLE */}
      {!loading && axes.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Label</th>
              <th className="p-2">Visuel</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {axes.map((a) => (
              <tr key={a.ID_AXE} className="border-b hover:bg-gray-50">
                {/* LABEL */}
                <td className="p-2 font-medium">{a.LABEL}</td>

                {/* VISUEL PRIORITAIRE : RECTANGLE > CARRÉ */}
                <td className="p-2">
                  {a.rectUrl ? (
                    <img
                      src={a.rectUrl}
                      className="h-12 rounded object-cover border"
                    />
                  ) : a.squareUrl ? (
                    <img
                      src={a.squareUrl}
                      className="h-12 w-12 rounded object-cover border"
                    />
                  ) : (
                    "—"
                  )}
                </td>

                <td className="p-2 text-right">
                  <Link
                    href={`/admin/axes/edit/${a.ID_AXE}`}
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
