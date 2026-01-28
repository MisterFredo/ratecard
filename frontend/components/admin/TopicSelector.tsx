"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Topic = {
  id_topic: string;
  label: string;
  topic_axis?: "BUSINESS" | "FIELD";
};

type Props = {
  values: Topic[];
  onChange: (topics: Topic[]) => void;
};

export default function TopicSelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/topic/list");

        const topics = res.topics || [];

        const businessTopics = topics.filter(
          (t: any) => t.TOPIC_AXIS === "BUSINESS"
        );
        const fieldTopics = topics.filter(
          (t: any) => t.TOPIC_AXIS === "FIELD"
        );

        const groupedOptions: SelectOption[] = [
          ...(businessTopics.length
            ? [
                {
                  id: "__group_business__",
                  label: "— Business & enjeux",
                  disabled: true,
                },
                ...businessTopics.map((t: any) => ({
                  id: t.ID_TOPIC,
                  label: t.LABEL,
                })),
              ]
            : []),

          ...(fieldTopics.length
            ? [
                {
                  id: "__group_field__",
                  label: "— Terrains & écosystèmes",
                  disabled: true,
                },
                ...fieldTopics.map((t: any) => ({
                  id: t.ID_TOPIC,
                  label: t.LABEL,
                })),
              ]
            : []),
        ];

        setOptions(groupedOptions);
      } catch (e) {
        console.error("Erreur chargement topics", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleChange(selected: SelectOption[]) {
    onChange(
      selected.map((s) => ({
        id_topic: s.id,
        label: s.label,
      }))
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Topics
      </label>

      <p className="text-sm text-gray-500">
        Sélectionnez un angle <strong>métier</strong> (BUSINESS) et,
        si pertinent, un ou plusieurs <strong>terrains</strong> (FIELD).
      </p>

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

