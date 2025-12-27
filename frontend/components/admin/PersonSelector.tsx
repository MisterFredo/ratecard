"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PersonSelector({ values, onChange }) {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD PERSONS + COMPANY + MEDIA
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) persons
      const resPersons = await api.get("/person/list");
      const rawPersons = resPersons.persons || [];

      // 2) companies map
      const resCompanies = await api.get("/company/list");
      const companyMap: Record<string, string> = {};
      (resCompanies.companies || []).forEach((c: any) => {
        companyMap[c.ID_COMPANY] = c.NAME;
      });

      // 3) enrich persons with media + company name
      const enriched = await Promise.all(
        rawPersons.map(async (p: any) => {
          const m = await api.get(
            `/media/by-entity?type=person&id=${p.ID_PERSON}`
          );

          const media = m.media || [];
          const square = media.find((m: any) => m.FORMAT === "square");

          return {
            id_person: p.ID_PERSON,
            name: p.NAME,
            title: p.TITLE || null,
            id_company: p.ID_COMPANY || null,
            companyName: p.ID_COMPANY ? companyMap[p.ID_COMPANY] : null,

            squareUrl: square
              ? `/media/${square.FILEPATH.replace("/uploads/media/", "")}`
              : null,
          };
        })
      );

      setPersons(enriched);
      setLoading(false);
    }

    load();
  }, []);

  /* -------------------------------------------------------
     TOGGLE PERSON
  ------------------------------------------------------- */
  function toggle(person) {
    const exists = values.find((v) => v.id_person === person.id_person);

    if (exists) {
      onChange(values.filter((v) => v.id_person !== person.id_person));
    } else {
      onChange([...values, person]);
    }
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Intervenants</label>

      {loading ? (
        <p className="text-gray-500 text-sm">Chargement…</p>
      ) : (
        <div className="space-y-2 border p-2 rounded bg-white">
          {persons.map((p) => {
            const selected = !!values.find(
              (v) => v.id_person === p.id_person
            );

            return (
              <label
                key={p.id_person}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggle(p)}
                />

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

                <div className="flex flex-col">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-600">
                    {p.title || "—"}
                    {p.companyName ? ` — ${p.companyName}` : ""}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

