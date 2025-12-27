"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CompanySelector({ value, onChange }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------
     LOAD COMPANIES + VISUELS
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      // 1) companies
      const res = await api.get("/company/list");
      const raw = res.companies || [];

      // 2) enrich with media
      const enriched = await Promise.all(
        raw.map(async (c: any) => {
          const m = await api.get(
            `/media/by-entity?type=company&id=${c.ID_COMPANY}`
          );
          const media = m.media || [];

          const rect = media.find((m) => m.FORMAT === "rectangle");
          const square = media.find((m) => m.FORMAT === "square");

          return {
            id_company: c.ID_COMPANY,
            name: c.NAME,
            rectUrl: rect
              ? `/media/${rect.FILEPATH.replace("/uploads/media/", "")}`
              : null,
            squareUrl: square
              ? `/media/${square.FILEPATH.replace("/uploads/media/", "")}`
              : null,
          };
        })
      );

      setCompanies(enriched);
      setLoading(false);
    }

    load();
  }, []);

  /* -------------------------------------------------------
     FIND SELECTED COMPANY
  ------------------------------------------------------- */
  const selected = companies.find(
    (c) => c.id_company === (value?.id_company || value)
  );

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Société</label>

      {loading ? (
        <div className="text-gray-500 text-sm">Chargement…</div>
      ) : (
        <select
          className="border p-2 w-full rounded"
          value={selected?.id_company || ""}
          onChange={(e) => {
            const id = e.target.value;
            const c = companies.find((co) => co.id_company === id) || null;
            onChange(c);
          }}
        >
          <option value="">Aucune</option>
          {companies.map((c) => (
            <option key={c.id_company} value={c.id_company}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Preview (optionnel) */}
      {selected && (
        <div className="flex items-center gap-3 mt-2">
          {selected.rectUrl && (
            <img
              src={selected.rectUrl}
              className="h-10 w-auto rounded border bg-white p-1"
            />
          )}
          {selected.squareUrl && (
            <img
              src={selected.squareUrl}
              className="h-10 w-10 rounded border bg-white object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}

