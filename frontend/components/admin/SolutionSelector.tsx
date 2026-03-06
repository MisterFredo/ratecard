"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

export type Solution = {
  id_solution: string;
  name: string;
};

type Props = {
  values: Solution[];
  onChange: (solutions: Solution[]) => void;
};

export default function SolutionSelector({
  values,
  onChange,
}: Props) {

  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function load() {

      setLoading(true);

      try {

        const res = await api.get("/solution/list");

        // ✅ Backend snake_case
        setOptions(
          (res.solutions || []).map((s: any) => ({
            id: s.id_solution,
            label: s.name,
          }))
        );

      } catch (e) {

        console.error("Erreur chargement solutions", e);
        setOptions([]);

      } finally {

        setLoading(false);

      }

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
        id_solution: item.id,
        name: item.label,
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
        id: v.id_solution,
        label: v.name,
      }))}
      onChange={handleChange}
    />
  );
}
