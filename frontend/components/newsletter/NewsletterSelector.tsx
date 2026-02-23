"use client";

type Props<T> = {
  title: string;
  items: T[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;

  labelKey: keyof T;
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
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(
        selectedIds.filter((x) => x !== id)
      );
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">
        {title}
      </h2>

      <div className="max-h-[360px] overflow-y-auto border border-gray-200 rounded-lg divide-y bg-white">
        {items.map((item) => {
          const label = String(
            item[labelKey]
          );

          const meta =
            metaKey && item[metaKey]
              ? String(item[metaKey])
              : null;

          const checked =
            selectedIds.includes(item.id);

          return (
            <label
              key={item.id}
              className={`
                flex items-start gap-3 p-3 text-sm cursor-pointer
                transition
                ${
                  checked
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                }
              `}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  toggle(item.id)
                }
                className="mt-1"
              />

              <div className="flex flex-col gap-0.5">
                <span className="text-gray-800 leading-snug">
                  {label}
                </span>

                {meta && (
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {meta}
                  </span>
                )}
              </div>
            </label>
          );
        })}

        {items.length === 0 && (
          <div className="p-3 text-sm text-gray-400">
            Aucun élément disponible
          </div>
        )}
      </div>
    </section>
  );
}
