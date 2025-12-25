// frontend/components/admin/CompanySelector.tsx

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CompanySelector({ value, onChange }) {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api.get("/company/list").then((res) => {
      setCompanies(res.companies || []);
    });
  }, []);

  return (
    <div className="space-y-2">
      <label className="font-medium">Société</label>
      <select
        className="border p-2 w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Aucune</option>
        {companies.map((c) => (
          <option key={c.ID_COMPANY} value={c.ID_COMPANY}>
            {c.NAME}
          </option>
        ))}
      </select>
    </div>
  );
}
