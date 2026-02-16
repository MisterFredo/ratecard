"use client";

import { useRouter, useSearchParams } from "next/navigation";

type TopicStat = {
  id_topic: string;
  label: string;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type TypeStat = {
  news_type?: string | null;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type CompanyStat = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type Props = {
  topics: TopicStat[];
  types: TypeStat[];
  companies: CompanyStat[];
};

export default function BrevesFilters({
  topics,
  types,
  companies,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");
  const selectedCompanies = searchParams.getAll("companies");

  function updateFilters(
    key: "topics" | "news_types" | "companies",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());
    const values = params.getAll(key);

    if (values.includes(value)) {
      params.delete(key);
      values
        .filter((v) => v !== value)
        .forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }

    router.push(`/breves?${params.toString()}`);
  }

  const members = companies.filter((c) => c.is_partner);
  const others = companies.filter((c) => !c.is_partner);

  return (
    <section className="border-b border-gray-300 pb-10 mb-12 space-y-12">

      {/* TYPES */}
      <FilterBlock title="Types">
        {types.map((t) => {
          const active = selectedTypes.includes(t.news_type || "");

          return (
            <FilterItem
              key={t.news_type || "null"}
              active={active}
              onClick={() =>
                updateFilters(
                  "news_types",
                  t.news_type || ""
                )
              }
              label={t.news_type || "Autre"}
              value={t.total}
            />
          );
        })}
      </FilterBlock>

      {/* TOPICS */}
      <FilterBlock title="Thématiques">
        {topics.map((t) => {
          const active = selectedTopics.includes(t.id_topic);

          return (
            <FilterItem
              key={t.id_topic}
              active={active}
              onClick={() =>
                updateFilters("topics", t.id_topic)
              }
              label={t.label}
              value={t.total}
            />
          );
        })}
      </FilterBlock>

      {/* SOCIÉTÉS */}
      <FilterBlock title="Sociétés">

        {members.length > 0 && (
          <>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Membres
            </div>

            {members.map((c) => {
              const active = selectedCompanies.includes(c.id_company);

              return (
                <FilterItem
                  key={c.id_company}
                  active={active}
                  onClick={() =>
                    updateFilters("companies", c.id_company)
                  }
                  label={c.name}
                  value={c.total}
                  highlight
                />
              );
            })}

            <div className="h-6" />
          </>
        )}

        {others.map((c) => {
          const active = selectedCompanies.includes(c.id_company);

          return (
            <FilterItem
              key={c.id_company}
              active={active}
              onClick={() =>
                updateFilters("companies", c.id_company)
              }
              label={c.name}
              value={c.total}
            />
          );
        })}
      </FilterBlock>

    </section>
  );
}

/* =========================================================
   SUB COMPONENTS
========================================================= */

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="uppercase text-xs tracking-wider text-gray-500 mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        {children}
      </div>
    </div>
  );
}

function FilterItem({
  label,
  value,
  active,
  onClick,
  highlight = false,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex justify-between border-b pb-2 text-sm transition
        ${
          active
            ? "text-black font-medium"
            : "text-gray-600 hover:text-black"
        }
        ${highlight ? "font-semibold" : ""}
      `}
    >
      <span>{label}</span>
      <span className="font-serif">{value}</span>
    </button>
  );
}
