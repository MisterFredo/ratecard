"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ---------------------------------------------------------
   TYPES EXPORTÉS
--------------------------------------------------------- */
export type Concept = {
  ID_CONCEPT: string;
  TITLE: string;
};

type Props = {
  values: Concept[];
  onChange: (concepts: Concept[]) => void;

  // 🔥 NOUVEAU — optionnel
  topicIds?: string[];
};

export default function ConceptSelector({
  values,
  onChange,
  topicIds,
}: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD CONCEPTS (DYNAMIQUE)
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        let url = "/concept/list";

        if (topicIds && topicIds.length > 0) {
          url += `?topic_ids=${topicIds.join(",")}`;
        }

        const res = await api.get(url);

        setOptions(
          (res.concepts || []).map((c: any) => ({
            id: c.ID_CONCEPT,
            label: c.TITLE,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement concepts", e);
        setOptions([]);
      }

      setLoading(false);
    }

    load();
  }, [topicIds]);

  /* ---------------------------------------------------------
     HANDLE CHANGE — MULTI
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {
    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    onChange(
      selected.map((item) => ({
        ID_CONCEPT: item.id,
        TITLE: item.label,
      }))
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Chargement des concepts…
      </div>
    );
  }

  return (
    <SearchableMultiSelect
      label="Concepts"
      placeholder="Rechercher un ou plusieurs concepts…"
      options={options}
      values={values.map((v) => ({
        id: v.ID_CONCEPT,
        label: v.TITLE,
      }))}
      onChange={handleChange}
    />
  );
}
