"use client";

import { SelectOption } from "@/components/ui/SearchableMultiSelect";

type Props = {
  topics: SelectOption[];
  companies: SelectOption[];
  types: SelectOption[];

  onRemoveTopic: (id: string) => void;
  onRemoveCompany: (id: string) => void;
  onRemoveType: (id: string) => void;
};

export default function DigestActiveFilters({
  topics,
  companies,
  types,
  onRemoveTopic,
  onRemoveCompany,
  onRemoveType,
}: Props) {
  const hasFilters =
    topics.length > 0 ||
    companies.length > 0 ||
    types.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
      <p className="text-xs font-semibold text-gray-600 uppercase">
        Filtres actifs
      </p>

      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <Tag
            key={`topic-${t.id}`}
            label={t.label}
            onRemove={() => onRemoveTopic(t.id)}
          />
        ))}

        {companies.map((c) => (
          <Tag
            key={`company-${c.id}`}
            label={c.label}
            onRemove={() => onRemoveCompany(c.id)}
          />
        ))}

        {types.map((t) => (
          <Tag
            key={`type-${t.id}`}
            label={t.label}
            onRemove={() => onRemoveType(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Tag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-full text-xs">
      {label}
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-700"
      >
        ×
      </button>
    </span>
  );
}
