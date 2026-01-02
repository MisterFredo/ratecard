"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Company = {
  id_company: string;
  name: string;
};

type Props = {
  values: Company[];
  onChange: (companies: Company[]) => void;
};

export default function CompanySelector({ values, onChange }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get("/company/list");
      setCompanies(
        (res.companies || []).map((c: any) => ({
          id_company: c.ID_COMPANY,
          name: c.NAME,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const selectedIds = values.map((v) => v.id_company);

  function toggle(company: Company) {
    if (selectedIds.includes(company.id_company)) {
      onChange(values.filter((v) => v.id_company !== company.id_company));
    } else {
      onChange([...values, company]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Sociétés</label>

      {loading ? (
        <div className="text-sm text-gray-500">Chargement…</div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {companies.map((c) => {
            const selected = selectedIds.includes(c.id_company);

            return (
              <div
                key={c.id_company}
                onClick={() => toggle(c)}
                className={`p-2 rounded cursor-pointer ${
                  selected
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{c.name}</span>
                {selected && (
                  <span className="ml-2 text-xs text-blue-600">
                    Sélectionnée
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
