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
  topic_axis?: "MEDIA" | "RETAIL" | "FOUNDATIONS" | null;
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
        const topics = res.data?.topics || [];

        const mediaTopics = topics.filter(
          (t: any) => t.topic_axis === "MEDIA"
        );

        const retailTopics = topics.filter(
          (t: any) => t.topic_axis === "RETAIL"
        );

        const foundationTopics = topics.filter(
          (t: any) => t.topic_axis === "FOUNDATIONS"
        );

        const groupedOptions: SelectOption[] = [
          ...(mediaTopics.length
            ? [
                {
                  id: "__group_media__",
                  label: "— Media",
                  disabled: true,
                },
                ...mediaTopics.map((t: any) => ({
                  id: t.id_topic,
                  label: t.label,
                })),
              ]
            : []),

          ...(retailTopics.length
            ? [
                {
                  id: "__group_retail__",
                  label: "— Retail",
                  disabled: true,
                },
                ...retailTopics.map((t: any) => ({
                  id: t.id_topic,
                  label: t.label,
                })),
              ]
            : []),

          ...(foundationTopics.length
            ? [
                {
                  id: "__group_foundations__",
                  label: "— Foundations",
                  disabled: true,
                },
                ...foundationTopics.map((t: any) => ({
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
