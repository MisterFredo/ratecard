"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NumberRow from "./NumberRow";

type NumberItem = {
  id: string;
  label?: string;
  value?: number;
  unit?: string;
  zone?: string;
  period?: string;
  actor?: string;
  context_title?: string;
};

type Props = {
  title: string;
  items: NumberItem[];
  selectedIds: string[];
  onToggleSelect: (item: NumberItem) => void;
};

export default function NumbersContentGroup({
  title,
  items,
  selectedIds,
  onToggleSelect,
}: Props) {

  const router = useRouter();
  const [open, setOpen] = useState(true);

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

      {/* ACTIONS */}
      <div className="flex gap-3 text-xs text-blue-600">

        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/item/${items[0]?.id}`);
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
