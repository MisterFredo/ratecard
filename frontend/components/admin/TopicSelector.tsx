"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Topic = {
  id_topic: string;
  label: string;
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
        setOptions(
          (res.topics || []).map((t: any) => ({
            id: t.ID_TOPIC,
            label: t.LABEL,
          }))
        );
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
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
    <div className="space-y-1">
      {loading ? (
        <div className="text-sm text-gray-500">Chargement des topics…</div>
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
