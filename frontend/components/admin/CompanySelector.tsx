"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Company = {
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
        console.error(e);
      }
      setLoading(false);
    }

    load();
  }, []);

  function handleChange(selected: SelectOption[]) {
    onChange(
      selected.map((s) => ({
        id_company: s.id,
        name: s.label,
      }))
    );
  }

  return (
    <div className="space-y-1">
      {loading ? (
        <div className="text-sm text-gray-500">
          Chargement des sociétés…
        </div>
      ) : (
        <SearchableMultiSelect
          label="Sociétés"
          placeholder="Rechercher une société…"
          options={options}
          values={values.map((v) => ({
            id: v.id_company,
            label: v.name,
          }))}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
