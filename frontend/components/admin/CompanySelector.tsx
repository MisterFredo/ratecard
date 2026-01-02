"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

// Person référentiel (API /person/list)
type PersonRef = {
  id_person: string;
  name: string;
  title?: string;
};

// Person associée à un article (avec rôle)
export type ArticlePerson = {
  id_person: string;
  name: string;
  title?: string;
  role: string;
};

type Props = {
  values: ArticlePerson[];
  onChange: (persons: ArticlePerson[]) => void;
};

export default function PersonSelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD PERSONS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/person/list");
        setOptions(
          (res.persons || []).map((p: any) => ({
            id: p.ID_PERSON,
            label: p.NAME,
          }))
        );
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     HANDLE CHANGE
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {
    const next: ArticlePerson[] = selected.map((s) => {
      const existing = values.find((v) => v.id_person === s.id);
      return (
        existing || {
          id_person: s.id,
          name: s.label,
          role: "contributeur", // rôle par défaut
        }
      );
    });

    onChange(next);
  }

  return (
    <div className="space-y-1">
      {loading ? (
        <div className="text-sm text-gray-500">
          Chargement des personnes…
        </div>
      ) : (
        <SearchableMultiSelect
          label="Personnes"
          placeholder="Rechercher une personne…"
          options={options}
          values={values.map((v) => ({
            id: v.id_person,
            label: v.name,
          }))}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
