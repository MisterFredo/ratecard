"use client";

import { useState } from "react";

/* ========================================================= */

type Props = {
  query: string;
  setQuery: (q: string) => void;

  onSearch: (filters?: {
    query?: string;
    frequency?: string;
    year?: number;
    period_from?: number;
    period_to?: number;
  }) => void;
};

/* ========================================================= */

export default function RadarHeader({
  query,
  setQuery,
  onSearch,
}: Props) {

  const [input, setInput] = useState(query);

  const [frequency, setFrequency] = useState<string>("");
  const [year, setYear] = useState<number | "">("");
  const [periodFrom, setPeriodFrom] = useState<number | "">("");
  const [periodTo, setPeriodTo] = useState<number | "">("");

  /* ========================================================= */

  function triggerSearch() {
    const value = input.trim();

    setQuery(value);

    onSearch({
      query: value || undefined,
      frequency: frequency || undefined,
      year: typeof year === "number" ? year : undefined,
      period_from: typeof periodFrom === "number" ? periodFrom : undefined,
      period_to: typeof periodTo === "number" ? periodTo : undefined,
    });
  }

  /* ========================================================= */

  function resetFilters() {
    setInput("");
    setQuery("");

    setFrequency("");
    setYear("");
    setPeriodFrom("");
    setPeriodTo("");

    onSearch({});
  }

  /* ========================================================= */

  function handleNumberInput(
    value: string,
    setter: (v: number | "") => void
  ) {
    if (value === "") {
      setter("");
      return;
    }

    const num = Number(value);

    if (!isNaN(num) && num > 0) {
      setter(num);
    }
  }

  /* ========================================================= */

  return (
    <div className="space-y-4">

      {/* TITLE */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Radar
        </h1>

        <p className="text-sm text-gray-500">
          Explorez les veilles marché.
          Filtrez par période et analysez les dynamiques.
        </p>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") triggerSearch();
          }}
          placeholder="Ex : Amazon, Retail Media, IA..."
          className="
            flex-1
            border border-gray-200
            rounded-lg
            px-4 py-2
            text-sm
            focus:outline-none focus:ring-2 focus:ring-black
          "
        />

        <button
          onClick={triggerSearch}
          className="
            px-4 py-2
            rounded-lg
            bg-black text-white
            text-sm
            hover:opacity-90 transition
          "
        >
          Rechercher
        </button>
      </div>

      {/* TIMELINE */}
      <div className="flex flex-wrap items-center gap-2 text-sm">

        {/* FREQUENCY */}
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="border border-gray-200 rounded px-2 py-1.5 text-xs"
        >
          <option value="">Toutes fréquences</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
        </select>

        {/* YEAR */}
        <input
          type="number"
          placeholder="2025"
          value={year}
          onChange={(e) =>
            handleNumberInput(e.target.value, setYear)
          }
          className="w-20 border border-gray-200 rounded px-2 py-1.5 text-xs"
        />

        {/* PERIOD FROM */}
        <input
          type="number"
          placeholder="De"
          value={periodFrom}
          onChange={(e) =>
            handleNumberInput(e.target.value, setPeriodFrom)
          }
          className="w-16 border border-gray-200 rounded px-2 py-1.5 text-xs"
        />

        {/* PERIOD TO */}
        <input
          type="number"
          placeholder="À"
          value={periodTo}
          onChange={(e) =>
            handleNumberInput(e.target.value, setPeriodTo)
          }
          className="w-16 border border-gray-200 rounded px-2 py-1.5 text-xs"
        />

        {/* APPLY */}
        <button
          onClick={triggerSearch}
          className="
            px-3 py-1.5
            text-xs
            bg-gray-100
            rounded
            hover:bg-gray-200
          "
        >
          Appliquer
        </button>

        {/* RESET */}
        <button
          onClick={resetFilters}
          className="
            px-3 py-1.5
            text-xs
            text-gray-400
            hover:text-gray-700
          "
        >
          Reset
        </button>

      </div>

    </div>
  );
}
