"use client";

import { useMemo } from "react";

type BaseItem = {
  id: string;
  published_at?: string;
  title?: string;
  excerpt?: string;
  company_name?: string;
  news_type?: string;
};

type Props<T extends BaseItem> = {
  title: string;
  items: T[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function NewsletterSelector<T extends BaseItem>({
  title,
  items,
  selectedIds,
  onChange,
}: Props<T>) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  // 🔥 Tri automatique par date décroissante
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (!a.published_at || !b.published_at) return 0;
      return (
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
      );
    });
  }, [items]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          {title}
        </h2>

        <span className="text-xs text-gray-400">
          {selectedIds.length} sélectionné(s)
        </span>
      </div>

      <div className="h-[420px] overflow-y-auto border border-gray-200 rounded-lg bg-white divide-y">

        {sortedItems.map((item) => {
          const checked = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`
                p-3 cursor-pointer transition
                ${checked ? "bg-blue-50" : "hover:bg-gray-50"}
              `}
            >
              <div className="flex items-start gap-3">

                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mt-1"
                />

                <div className="flex flex-col gap-1 w-full">

                  {/* META */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide">
                    {item.news_type && <span>{item.news_type}</span>}
                    {item.company_name && <span>• {item.company_name}</span>}
                    {item.published_at && (
                      <span className="ml-auto">
                        {formatDate(item.published_at)}
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <div className="text-sm font-medium text-gray-900 leading-snug">
                    {item.title}
                  </div>

                  {/* EXCERPT */}
                  {item.excerpt && (
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {item.excerpt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">
            Aucun élément disponible
          </div>
        )}
      </div>
    </section>
  );
}
