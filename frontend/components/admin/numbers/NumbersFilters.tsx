"use client";

type Filters = {
  entity_type: string;
  frequency: string;
  year: number;
};

export default function NumbersFilters({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {

  return (
    <div className="flex gap-4 items-center">

      {/* ENTITY */}
      <select
        value={filters.entity_type}
        onChange={(e) =>
          setFilters({
            ...filters,
            entity_type: e.target.value,
          })
        }
        className="border px-3 py-1 rounded"
      >
        <option value="topic">Topic</option>
        <option value="company">Company</option>
        <option value="solution">Solution</option>
      </select>

      {/* FREQUENCY */}
      <select
        value={filters.frequency}
        onChange={(e) =>
          setFilters({
            ...filters,
            frequency: e.target.value,
          })
        }
        className="border px-3 py-1 rounded"
      >
        <option value="WEEKLY">Weekly</option>
        <option value="MONTHLY">Monthly</option>
        <option value="QUARTERLY">Quarterly</option>
      </select>

      {/* YEAR */}
      <input
        type="number"
        value={filters.year}
        onChange={(e) =>
          setFilters({
            ...filters,
            year: Number(e.target.value),
          })
        }
        className="border px-3 py-1 rounded w-24"
      />

    </div>
  );
}
