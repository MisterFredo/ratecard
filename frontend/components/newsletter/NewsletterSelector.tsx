"use client";

import { useCallback } from "react";

type Props<T> = {
  title: string;
  items: T[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;

  labelKey?: keyof T;
  metaKey?: keyof T;
};

export default function NewsletterSelector<
  T extends { id: string }
>({
  title,
  items,
  selectedIds,
  onChange,
  labelKey,
  metaKey,
}: Props<T>) {

  const toggle = useCallback(
    (id: string) => {
      const isSelected = selectedIds.includes(id);

      if (isSelected) {
        onChange(selectedIds.filter((x) => x !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange]
  );

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>

      <div className="max-h-[380px] overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y shadow-sm">
        {items.length === 0 && (
          <div className="p-4 text-sm text-gray-400">
            Aucun élément disponible
          </div>
        )}

        {items.map((item) => {
          const resolvedLabelKey =
            labelKey ?? ("title" as keyof T);

          const label = String(item[resolvedLabelKey] ?? "");

          const meta =
            metaKey && item[metaKey]
              ? String(item[metaKey])
              : null;

          const checked = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`
                flex items-start gap-3 p-4 text-sm cursor-pointer
                transition-all
                ${checked ? "bg-gray-50" : "hover:bg-gray-50"}
              `}
              onClick={() => toggle(item.id)}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 accent-black"
              />

              <div className="flex flex-col gap-1">
                <span className="text-gray-900 leading-snug font-medium">
                  {label}
                </span>

                {meta && (
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {meta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
