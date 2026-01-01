"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AxesEditor({ values, onChange }) {
  const [axes, setAxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD AXES + VISUELS GCS
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get("/axes/list");
      const raw = res.axes || [];

      const enriched = await Promise.all(
        raw.map(async (a: any) => {
          const visu = await api.get(`/visuals/axe/get?id_axe=${a.ID_AXE}`);

          return {
            id_axe: a.ID_AXE,
            label: a.LABEL,
            description: a.DESCRIPTION || "",

            squareUrl: visu?.square_url || null,
            rectUrl: visu?.rectangle_url || null,
          };
        })
      );

      setAxes(enriched);
      setLoading(false);
    }

    load();
  }, []);

  /* -------------------------------------------------------
     SELECTED AXES
  ------------------------------------------------------- */
  const selectedIds = values?.map((v: any) => v.id_axe) || [];

  function toggle(axis: any) {
    const already = selectedIds.includes(axis.id_axe);

    if (already) {
      onChange(values.filter((v: any) => v.id_axe !== axis.id_axe));
    } else {
      onChange([...values, axis]);
    }
  }

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Axes éditoriaux</label>

      {loading ? (
        <div className="text-gray-500 text-sm">Chargement…</div>
      ) : (
        <div className="border rounded p-3 bg-white max-h-64 overflow-auto space-y-2">
          {axes.map((a) => {
            const selected = selectedIds.includes(a.id_axe);

            return (
              <div
                key={a.id_axe}
                onClick={() => toggle(a)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  selected ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50"
                }`}
              >
                {/* ICON / IMAGE */}
                {a.squareUrl ? (
                  <img
                    src={a.squareUrl}
                    className="h-10 w-10 rounded object-cover border bg-white"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    —
                  </div>
                )}

                <div className="flex-1">
                  <div className="font-medium">{a.label}</div>
                  {a.description && (
                    <div className="text-xs text-gray-500">{a.description}</div>
                  )}
                </div>

                {selected && (
                  <div className="text-blue-600 text-xs font-semibold">Sélectionné</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
