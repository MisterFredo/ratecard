"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

export type Solution = {
  ID_SOLUTION: string;
  NAME: string;
};

type Props = {
  values: Solution[];
  onChange: (solutions: Solution[]) => void;
};

export default function SolutionSelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/solution/list");

        setOptions(
          (res.solutions || []).map((s: any) => ({
            id: s.ID_SOLUTION,
            label: s.NAME,   // ✅ CORRIGÉ
          }))
        );
      } catch (e) {
        console.error("Erreur chargement solutions", e);
      }
      setLoading(false);
    }

    load();
  }, []);

  function handleChange(selected: SelectOption[]) {
    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    onChange(
      selected.map((item) => ({
        ID_SOLUTION: item.id,
        NAME: item.label,   // ✅ CORRIGÉ
      }))
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Chargement des solutions…
      </div>
    );
  }

  return (
    <SearchableMultiSelect
      label="Solutions"
      placeholder="Rechercher une ou plusieurs solutions…"
      options={options}
      values={values.map((v) => ({
        id: v.ID_SOLUTION,
        label: v.NAME,   // ✅ CORRIGÉ
      }))}
      onChange={handleChange}
    />
  );
}
