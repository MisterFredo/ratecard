"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PersonSelector({ values, onChange }) {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD PERSONS + VISUELS DAM
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get("/person/list");
      const raw = res.persons || [];

      // Enrichir avec portrait carrés/rectangles
      const enriched = await Promise.all(
        raw.map(async (p: any) => {
          const visu = await api.get(`/visuals/person/get?id_person=${p.ID_PERSON}`);

          return {
            id_person: p.ID_PERSON,
            name: p.NAME,
            title: p.TITLE || "",
            company: p.ID_COMPANY || null,

            squareUrl: visu?.square_url || null,
            rectUrl: visu?.rectangle_url || null,
          };
        })
      );

      setPersons(enriched);
      setLoading(false);
    }

    load();
  }, []);

  /* -------------------------------------------------------
     SELECTED (0..N persons)
  ------------------------------------------------------- */
  const selectedIds = values?.map((v: any) => v.id_person) || [];

  function toggle(p: any) {
    const already = selectedIds.includes(p.id_person);

    if (already) {
      onChange(values.filter((v: any) => v.id_person !== p.id_person));
    } else {
      onChange([...values, p]);
    }
  }

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Intervenants</label>

      {loading ? (
        <div className="text-gray-500 text-sm">Chargement…</div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {persons.map((p) => {
            const selected = selectedIds.includes(p.id_person);

            return (
              <div
                key={p.id_person}
                onClick={() => toggle(p)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  selected ? "bg-blue-50 border-blue-300 border" : "hover:bg-gray-50"
                }`}
              >
                {/* PORTRAIT */}
                {p.squareUrl ? (
                  <img
                    src={p.squareUrl}
                    className="h-10 w-10 rounded-full object-cover border bg-white"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    —
                  </div>
                )}

                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.title}</div>
                </div>

                {selected && (
                  <div className="text-blue-600 font-semibold text-xs">Sélectionné</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
