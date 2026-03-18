"use client";

import { Input } from "@/components/ui/Input";
import ModeToggle from "./ModeToggle";

import type { FeedFilters } from "@/types/feed";

type Props = {
  filters: FeedFilters;
  onChange: (f: FeedFilters) => void;
};

export default function FeedControlBar({
  filters,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white border rounded-lg">

      {/* TOP ROW */}
      <div className="flex items-center gap-3">

        {/* SEARCH */}
        <Input
          placeholder="Rechercher un sujet, une entreprise..."
          value={filters.query}
          onChange={(e) =>
            onChange({ ...filters, query: e.target.value })
          }
        />

        {/* MODE */}
        <ModeToggle
          value={filters.mode}
          onChange={(mode) =>
            onChange({ ...filters, mode })
          }
        />
      </div>

      {/* FILTER CHIPS (V1 simple → à enrichir ensuite) */}
      <div className="text-xs text-gray-500">
        Filtres avancés à venir (topics, sociétés…)
      </div>

    </div>
  );
}
