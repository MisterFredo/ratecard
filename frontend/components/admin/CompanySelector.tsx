"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ---------------------------------------------------------
   TYPES EXPORTÉS
--------------------------------------------------------- */
export type Company = {
  id_company: string;
  name: string;
};

type Props = {
  values: Company[];
  onChange: (companies: Company[]) => void;
};

export default function CompanySelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD COMPANIES
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/company/list");
        setOptions(
          (res.companies || []).map((c: any) => ({
            id: c.ID_COMPANY,
            label: c.NAME,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement sociétés", e);
      }
      setLoading(false);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     HANDLE CHANGE — MULTI AUTORISÉ
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {
    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    onChange(
      selected.map((item) => ({
        id_company: item.id,
        name: item.label,
      }))
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Chargement des sociétés…
      </div>
    );
  }

  return (
    <SearchableMultiSelect
      label="Sociétés"
      placeholder="Rechercher une ou plusieurs sociétés…"
      options={options}
      values={values.map((v) => ({
        id: v.id_company,
        label: v.name,
      }))}
      onChange={handleChange}
    />
  );
}
