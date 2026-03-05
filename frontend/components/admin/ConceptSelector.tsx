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

  // Optionnel : filtrage dynamique par topics
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

    // Évite double appel si topicIds pas encore défini
    if (topicIds === undefined) return;

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
            id: c.ID_CONCEPT,
            label: c.TITLE,
          }));

        setOptions(mappedOptions);

      } catch (e) {

        console.error("Erreur chargement concepts", e);
        setOptions([]);

      }

      setLoading(false);

    }

    load();

  }, [topicIds]);

  /* ---------------------------------------------------------
     NETTOYAGE AUTOMATIQUE DES CONCEPTS INVALIDES
     (si topic change et que certains concepts ne sont plus valides)
  --------------------------------------------------------- */
  useEffect(() => {

    if (!options.length || !values.length) return;

    const validIds = options.map((o) => o.id);

    const filtered = values.filter((v) =>
      validIds.includes(v.ID_CONCEPT)
    );

    if (filtered.length !== values.length) {
      onChange(filtered);
    }

  }, [options, values, onChange]);

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
        id: v.ID_CONCEPT,
        label: v.TITLE,
      }))}
      onChange={handleChange}
    />
  );

}
