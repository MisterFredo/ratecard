"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NumberRow from "./NumberRow";

type Concept = {
  id_concept: string;
  title: string;
};

type NumberItem = {
  id: string;
  label?: string;
  value?: number;
  unit?: string;
  zone?: string;
  period?: string;
  actor?: string;
  context_title?: string;
  concepts?: Concept[];
};

type Props = {
  title: string;
  items: NumberItem[];
  selectedIds: string[];
  onToggleSelect: (item: NumberItem) => void;
  onSelectConcept?: (concept: string) => void;
};

export default function NumbersContentGroup({
  title,
  items,
  selectedIds,
  onToggleSelect,
  onSelectConcept,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const concepts = items[0]?.concepts || [];

  return (
    <section className="space-y-3">

      {/* HEADER */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="text-sm font-semibold text-gray-800">
          {title}
        </div>

        <div className="text-xs text-gray-400">
          {items.length} chiffres • {open ? "−" : "+"}
        </div>
      </div>

      {/* CONCEPTS */}
      {concepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {concepts.map((c) => (
            <button
              key={c.id_concept}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConcept?.(c.title);
              }}
              className="
                text-xs px-2 py-1 rounded
                bg-gray-100 hover:bg-gray-200
              "
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* ACTION */}
      <div className="flex gap-3 text-xs text-blue-600">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const first = items[0];
            if (!first) return;
            router.push(`/item/${first.id}`);
          }}
        >
          Voir le contenu
        </button>
      </div>

      {/* LIST */}
      {open && (
        <div className="space-y-2">
          {items.map((item) => {

            const selected = selectedIds.includes(item.id);

            return (
              <NumberRow
                key={item.id}
                item={item}
                selected={selected}
                onClick={() => onToggleSelect(item)}
              />
            );
          })}
        </div>
      )}

    </section>
  );
}
