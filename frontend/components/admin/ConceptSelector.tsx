"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ---------------------------------------------------------
   TYPES (UI = snake_case)
--------------------------------------------------------- */
export type Concept = {
  id_concept: string;
  title: string;
};

type Props = {
  values: Concept[];
  onChange: (concepts: Concept[]) => void;
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
     LOAD CONCEPTS (DYNAMIQUE SELON TOPICS)
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

        const mappedOptions: SelectOption[] =
          (res.concepts || []).map((c: any) => ({
            id: c.id_concept,
            label: c.title,
          }));

        setOptions(mappedOptions);

      } catch (e) {

        console.error("Erreur chargement concepts", e);
        setOptions([]);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, [topicIds]);

  /* ---------------------------------------------------------
     NETTOYAGE AUTOMATIQUE DES CONCEPTS INVALIDES
  --------------------------------------------------------- */
  useEffect(() => {

    if (!options.length || !values.length) return;

    const validIds = options.map((o) => o.id);

    const filtered = values.filter((v) =>
      validIds.includes(v.id_concept)
    );

    if (filtered.length !== values.length) {
      onChange(filtered);
    }

  }, [options]); // eslint-disable-line

  /* ---------------------------------------------------------
     HANDLE CHANGE
  --------------------------------------------------------- */
  function handleChange(selected: SelectOption[]) {

    if (!selected || selected.length === 0) {
      onChange([]);
      return;
    }

    onChange(
      selected.map((item) => ({
        id_concept: item.id,
        title: item.label,
      }))
    );

  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

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
        id: v.id_concept,
        label: v.title,
      }))}
      onChange={handleChange}
    />
  );

}
