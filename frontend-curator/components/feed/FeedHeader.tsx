"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Option = {
  value: string;
  label: string;
};

type Props = {
  query: string;
  setQuery: (v: string) => void;

  types: string[];
  setTypes: (v: string[]) => void;

  newsTypes: string[];
  setNewsTypes: (v: string[]) => void;

  onSearch: () => void;
  onReset: () => void;
};

/* ========================================================= */

export default function FeedHeader({
  query,
  setQuery,
  types,
  setTypes,
  newsTypes,
  setNewsTypes,
  topicIds,
  setTopicIds,
  companyIds,
  setCompanyIds,
  solutionIds,
  setSolutionIds,
  onSearch,
  onReset,
}: Props) {
  const [input, setInput] = useState(query);

  const [newsTypeOptions, setNewsTypeOptions] = useState<Option[]>([]);
  const [topicOptions, setTopicOptions] = useState<Option[]>([]);
  const [companyOptions, setCompanyOptions] = useState<Option[]>([]);
  const [solutionOptions, setSolutionOptions] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD META (BQ)
  ========================================================= */

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const res = await api.get("/curator/feed/meta");

        const items = res?.items || [];

        const newsTypes: Option[] = [];
        const topics: Option[] = [];
        const companies: Option[] = [];
        const solutions: Option[] = [];

        items.forEach((i: any) => {
          if (i.type === "news_type") {
            newsTypes.push({ value: i.value, label: i.label });
          }
          if (i.type === "topic") {
            topics.push({ value: i.value, label: i.label });
          }
          if (i.type === "company") {
            companies.push({ value: i.value, label: i.label });
          }
          if (i.type === "solution") {
            solutions.push({ value: i.value, label: i.label });
          }
        });

        setNewsTypeOptions(newsTypes);
        setTopicOptions(topics);
        setCompanyOptions(companies);
        setSolutionOptions(solutions);
      } catch (e) {
        console.error("❌ meta load error", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  function toggle(list: string[], set: (v: string[]) => void, value: string) {
    if (list.includes(value)) {
      set(list.filter((v) => v !== value));
    } else {
      set([...list, value]);
    }
  }

  function handleSearch() {
    setQuery(input);
    onSearch();
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-5">

      {/* SEARCH */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search (Amazon, clean room, retail media...)"
          className="
            flex-1 border border-gray-300 px-4 py-2.5 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-black/10
          "
        />

        <button
          onClick={handleSearch}
          className="px-5 py-2.5 bg-black text-white text-sm rounded-lg"
        >
          Search
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3">

        {/* TYPE */}
        <FilterGroup label="Type">
          {["news", "analysis"].map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={types.includes(t)}
              onClick={() => toggle(types, setTypes, t)}
            />
          ))}
        </FilterGroup>

        {/* NEWS TYPE */}
        <FilterGroup label="News type">
          {newsTypeOptions.map((t) => (
            <FilterChip
              key={t.value}
              label={t.label}
              active={newsTypes.includes(t.value)}
              onClick={() => toggle(newsTypes, setNewsTypes, t.value)}
            />
          ))}
        </FilterGroup>

        {/* TOPICS */}
        <FilterScrollable
          label="Topics"
          options={topicOptions}
          selected={topicIds}
          onToggle={(v) => toggle(topicIds, setTopicIds, v)}
        />

        {/* COMPANIES */}
        <FilterScrollable
          label="Companies"
          options={companyOptions}
          selected={companyIds}
          onToggle={(v) => toggle(companyIds, setCompanyIds, v)}
        />

        {/* SOLUTIONS */}
        <FilterScrollable
          label="Solutions"
          options={solutionOptions}
          selected={solutionIds}
          onToggle={(v) => toggle(solutionIds, setSolutionIds, v)}
        />
      </div>
    </div>
  );
}

/* ========================================================= */

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{label}:</span>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

/* ========================================================= */

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs border transition
        ${
          active
            ? "bg-black text-white border-black"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ========================================================= */

function FilterScrollable({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-400">{label}</div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={selected.includes(opt.value)}
            onClick={() => onToggle(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
