"use client";

export type Topic = {
  ID_TOPIC: string;
  LABEL: string;
};

type Props = {
  topics: Topic[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

export default function MultiSelectTopics({
  topics,
  selected,
  onChange,
}: Props) {

  function toggle(id: string) {

    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }

    if (selected.length >= 3) return;

    onChange([...selected, id]);
  }

  return (
    <div className="space-y-2">

      <label className="block text-sm font-medium">
        Topics (max 3)
      </label>

      <div className="flex flex-wrap gap-2">

        {topics.map((t) => {

          const active = selected.includes(t.ID_TOPIC);

          return (
            <button
              key={t.ID_TOPIC}
              type="button"
              onClick={() => toggle(t.ID_TOPIC)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t.LABEL}
            </button>
          );
        })}

      </div>

    </div>
  );
}
