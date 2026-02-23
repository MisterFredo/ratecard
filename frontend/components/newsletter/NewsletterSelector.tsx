"use client";

import { useCallback, useMemo } from "react";

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

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
        {title}
      </h2>

      <div className="
        max-h-[420px]
        overflow-y-auto
        border border-gray-200
        rounded-2xl
        bg-white
        divide-y
        shadow-sm
      ">

        {items.length === 0 && (
          <div className="px-5 py-6 text-sm text-gray-400">
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

          const checked = selectedSet.has(item.id);

          return (
            <div
              key={item.id}
              className={`
                group
                flex items-start gap-4
                px-5 py-4
                text-sm
                cursor-pointer
                transition-all duration-150
                ${
                  checked
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() => toggle(item.id)}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    h-4 w-4
                    accent-black
                    cursor-pointer
                  "
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="
                  text-gray-900
                  leading-relaxed
                  font-medium
                  break-words
                ">
                  {label}
                </span>

                {meta && (
                  <span className="
                    text-xs
                    text-gray-400
                    uppercase
                    tracking-wide
                  ">
                    {meta}
                  </span>
                )}
              </div>

              {checked && (
                <div className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-black
                  opacity-60
                ">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
