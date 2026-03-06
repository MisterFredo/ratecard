"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ---------------------------------------------------------
   UI TYPE — snake_case uniquement
--------------------------------------------------------- */
export type Solution = {
  id_solution: string;
  name: string;
};

type Props = {
  values: Solution[];
  onChange: (solutions: Solution[]) => void;
};

type SolutionApi = {
  id_solution: string;
  name: string;
};

export default function SolutionSelector({
  values,
  onChange,
}: Props) {

  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD SOLUTIONS
  --------------------------------------------------------- */
  useEffect(() => {

    async function load() {

      try {

        setLoading(true);

        const res = await api.get("/solution/list");

        const solutions: SolutionApi[] = res?.solutions || [];

        const mappedOptions: SelectOption[] = solutions.map((s) => ({
          id: s.id_solution,
          label: s.name,
        }));

        setOptions(mappedOptions);

      } catch (e) {

        console.error("Erreur chargement solutions", e);
        setOptions([]);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  /* ---------------------------------------------------------
     HANDLE CHANGE
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {

    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    const mapped: Solution[] = selected.map((item) => ({
      id_solution: item.id,
      name: item.label,
    }));

    onChange(mapped);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

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
