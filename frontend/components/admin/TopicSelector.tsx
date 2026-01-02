"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Topic = {
  id_topic: string;
  label: string;
};

type Props = {
  values: Topic[];
  onChange: (topics: Topic[]) => void;
};

export default function TopicSelector({ values, onChange }: Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await api.get("/topic/list");
      setTopics(
        (res.topics || []).map((t: any) => ({
          id_topic: t.ID_TOPIC,
          label: t.LABEL,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const selectedIds = values.map((v) => v.id_topic);

  function toggle(topic: Topic) {
    if (selectedIds.includes(topic.id_topic)) {
      onChange(values.filter((v) => v.id_topic !== topic.id_topic));
    } else {
      onChange([...values, topic]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">
        Topics <span className="text-red-500">*</span>
      </label>

      {loading ? (
        <div className="text-sm text-gray-500">Chargement…</div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {topics.map((t) => {
            const selected = selectedIds.includes(t.id_topic);

            return (
              <div
                key={t.id_topic}
                onClick={() => toggle(t)}
                className={`p-2 rounded cursor-pointer ${
                  selected
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                {selected && (
                  <span className="ml-2 text-xs text-blue-600">
                    Sélectionné
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
