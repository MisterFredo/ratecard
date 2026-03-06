"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* =========================================================
   TYPES
========================================================= */

export type Topic = {
  id_topic: string;
  label: string;
  topic_axis?: "BUSINESS" | "FIELD" | null;
};

type Props = {
  values: Topic[];
  onChange: (topics: Topic[]) => void;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TopicSelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD TOPICS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/topic/list");
        const topics = res.topics || [];

        const businessTopics = topics.filter(
          (t: any) => t.topic_axis === "BUSINESS"
        );

        const fieldTopics = topics.filter(
          (t: any) => t.topic_axis === "FIELD"
        );

        const otherTopics = topics.filter(
          (t: any) => !t.topic_axis
        );

        const groupedOptions: SelectOption[] = [
          ...(businessTopics.length
            ? [
                {
                  id: "__group_business__",
                  label: "— Angles métier (BUSINESS)",
                  disabled: true,
                },
                ...businessTopics.map((t: any) => ({
                  id: t.id_topic,
                  label: t.label,
                })),
              ]
            : []),

          ...(fieldTopics.length
            ? [
                {
                  id: "__group_field__",
                  label: "— Terrains & écosystèmes (FIELD)",
                  disabled: true,
                },
                ...fieldTopics.map((t: any) => ({
                  id: t.id_topic,
                  label: t.label,
                })),
              ]
            : []),

          ...(otherTopics.length
            ? [
                {
                  id: "__group_other__",
                  label: "— Autres topics (à qualifier)",
                  disabled: true,
                },
                ...otherTopics.map((t: any) => ({
                  id: t.id_topic,
                  label: t.label,
                })),
              ]
            : []),
        ];

        setOptions(groupedOptions);
      } catch (e) {
        console.error("❌ Erreur chargement topics", e);
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
    onChange(
      selected.map((s) => ({
        id_topic: s.id,
        label: s.label,
      }))
    );
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-1">
      {loading ? (
        <div className="text-sm text-gray-500">
          Chargement des topics…
        </div>
      ) : (
        <SearchableMultiSelect
          label="Topics"
          required
          placeholder="Rechercher un topic…"
          options={options}
          values={values.map((v) => ({
            id: v.id_topic,
            label: v.label,
          }))}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
