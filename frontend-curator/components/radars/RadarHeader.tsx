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
      year: year || undefined,
      period_from: periodFrom || undefined,
      period_to: periodTo || undefined,
    });
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

      {/* TIMELINE FILTERS */}
      <div className="flex flex-wrap items-center gap-3 text-sm">

        {/* FREQUENCY */}
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="border border-gray-200 rounded px-3 py-2"
        >
          <option value="">Toutes fréquences</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
        </select>

        {/* YEAR */}
        <input
          type="number"
          placeholder="Année"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 border border-gray-200 rounded px-3 py-2"
        />

        {/* PERIOD FROM */}
        <input
          type="number"
          placeholder="De"
          value={periodFrom}
          onChange={(e) => setPeriodFrom(Number(e.target.value))}
          className="w-20 border border-gray-200 rounded px-3 py-2"
        />

        {/* PERIOD TO */}
        <input
          type="number"
          placeholder="À"
          value={periodTo}
          onChange={(e) => setPeriodTo(Number(e.target.value))}
          className="w-20 border border-gray-200 rounded px-3 py-2"
        />

        {/* APPLY */}
        <button
          onClick={triggerSearch}
          className="
            px-3 py-2
            text-xs
            bg-gray-100
            rounded
            hover:bg-gray-200
          "
        >
          Appliquer
        </button>

      </div>

    </div>
  );
}
