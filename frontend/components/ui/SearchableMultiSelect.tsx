"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
  id: string;
  label: string;
};

type Props = {
  label: string;
  placeholder?: string;
  required?: boolean;

  options: SelectOption[];
  values: SelectOption[];
  onChange: (values: SelectOption[]) => void;
};

export default function SearchableMultiSelect({
  label,
  placeholder = "Rechercher…",
  required = false,
  options,
  values,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedIds = useMemo(
    () => new Set(values.map((v) => v.id)),
    [values]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(option: SelectOption) {
    if (selectedIds.has(option.id)) {
      onChange(values.filter((v) => v.id !== option.id));
    } else {
      onChange([...values, option]);
    }
  }

  function remove(optionId: string) {
    onChange(values.filter((v) => v.id !== optionId));
  }

  /* ---------------------------------------------------------
     Close dropdown on outside click
  --------------------------------------------------------- */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* SELECTED TAGS */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
            >
              {v.label}
              <button
                type="button"
                onClick={() => remove(v.id)}
                className="text-blue-700 hover:text-blue-900"
                title="Retirer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* DROPDOWN */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full border rounded px-3 py-2 text-left bg-white"
        >
          <span className="text-gray-500">
            {values.length > 0
              ? "Modifier la sélection"
              : placeholder}
          </span>
        </button>

        {open && (
          <div className="absolute z-20 mt-2 w-full bg-white border rounded shadow-lg">
            {/* SEARCH */}
            <div className="p-2 border-b">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>

            {/* OPTIONS */}
            <div className="max-h-64 overflow-auto">
              {filtered.length === 0 && (
                <div className="p-3 text-sm text-gray-500">
                  Aucun résultat
                </div>
              )}

              {filtered.map((o) => {
                const selected = selectedIds.has(o.id);

                return (
                  <div
                    key={o.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(o);
                    }}
                    className={`px-3 py-2 cursor-pointer text-sm select-none ${
                      selected
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {o.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

