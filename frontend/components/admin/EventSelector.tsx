"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Event = {
  id_event: string;
  label: string;
};

type Props = {
  values: Event[];
  onChange: (events: Event[]) => void;
};

export default function EventSelector({ values, onChange }: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/event/list");
        setOptions(
          (res.events || []).map((e: any) => ({
            id: e.ID_EVENT,
            label: e.LABEL,
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
        id_event: s.id,
        label: s.label,
      }))
    );
  }

  return (
    <div className="space-y-1">
      {loading ? (
        <div className="text-sm text-gray-500">
          Chargement des événements…
        </div>
      ) : (
        <SearchableMultiSelect
          label="Événements"
          required={false}
          placeholder="Rechercher un événement…"
          options={options}
          values={values.map((v) => ({
            id: v.id_event,
            label: v.label,
          }))}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
