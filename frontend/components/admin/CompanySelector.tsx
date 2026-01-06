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
     HANDLE CHANGE
     ⚠️ Règle métier : UNE seule société autorisée
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {
    if (selected.length === 0) {
      onChange([]);
      return;
    }

    // On garde UNIQUEMENT la dernière société sélectionnée
    const last = selected[selected.length - 1];

    onChange([
      {
        id_company: last.id,
        name: last.label,
      },
    ]);
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
      label="Société"
      placeholder="Rechercher une société…"
      options={options}
      values={values.map((v) => ({
        id: v.id_company,
        label: v.name,
      }))}
      onChange={handleChange}
    />
  );
}
