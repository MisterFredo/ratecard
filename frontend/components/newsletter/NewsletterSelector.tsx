"use client";

type Props<T> = {
  title: string;
  items: T[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  labelKey: keyof T;
};

export default function NewsletterSelector<T extends { id: string }>({
  title,
  items,
  selectedIds,
  onChange,
  labelKey,
}: Props<T>) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">
        {title}
      </h2>

      <div className="max-h-[360px] overflow-y-auto border border-gray-200 rounded-lg divide-y">
        {items.map((item) => {
          const label = String(item[labelKey]);

          return (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 text-sm cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-1"
              />

              <span className="text-gray-800">
                {label}
              </span>
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
