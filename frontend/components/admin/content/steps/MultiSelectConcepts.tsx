"use client";

export type Concept = {
  ID_CONCEPT: string;
  LABEL: string;
};

type Props = {
  concepts: Concept[];
  selected: string[];
  onChange: (ids: string[]) => void;
};

export default function MultiSelectConcepts({
  concepts,
  selected,
  onChange,
}: Props) {

  function toggle(id: string) {

    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }

    // 🔥 limite différente des topics
    if (selected.length >= 4) return;

    onChange([...selected, id]);
  }

  return (
    <div className="space-y-2">

      <label className="block text-sm font-medium">
        Concepts (max 4)
      </label>

      <div className="flex flex-wrap gap-2">

        {concepts.map((c) => {

          const active = selected.includes(c.ID_CONCEPT);

          return (
            <button
              key={c.ID_CONCEPT}
              type="button"
              onClick={() => toggle(c.ID_CONCEPT)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                active
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {c.LABEL}
            </button>
          );
        })}

      </div>

    </div>
  );
}
