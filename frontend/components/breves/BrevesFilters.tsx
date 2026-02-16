"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* ===============================
   TYPES
================================ */

type CompanyStat = {
  id_company: string;
  name: string;
  is_partner: boolean;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type TopicStat = {
  id_topic: string;
  label: string;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type TypeStat = {
  news_type: string;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type StatsResponse = {
  top_companies: CompanyStat[];
  top_topics: TopicStat[];
  top_types: TypeStat[];
};

/* ===============================
   COMPONENT
================================ */

export default function BrevesFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<
    "total" | "last_7_days" | "last_30_days"
  >("last_7_days");

  const [axis, setAxis] = useState<
    "companies" | "topics" | "types"
  >("companies");

  const [stats, setStats] = useState<StatsResponse>({
    top_companies: [],
    top_topics: [],
    top_types: [],
  });

  const [openOthers, setOpenOthers] = useState(false);

  const selectedCompanies = searchParams.getAll("companies");
  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");

  /* ===============================
     FETCH
  ================================ */

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `${API_BASE}/news/breves/stats`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = await res.json();
      setStats(json);
    }
    load();
  }, []);

  /* ===============================
     HELPERS
  ================================ */

  function toggleFilter(
    key: "companies" | "topics" | "news_types",
    value: string
  ) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);

    if (current.includes(value)) {
      params.delete(key);
      current
        .filter((c) => c !== value)
        .forEach((c) => params.append(key, c));
    } else {
      params.append(key, value);
    }

    router.push(`/breves?${params.toString()}`);
  }

  function SwitchButton({
    value,
    label,
  }: {
    value: "total" | "last_7_days" | "last_30_days";
    label: string;
  }) {
    const active = mode === value;

    return (
      <button
        onClick={() => setMode(value)}
        className={`text-xs uppercase tracking-wider transition
          ${
            active
              ? "text-black font-semibold"
              : "text-gray-400 hover:text-black"
          }`}
      >
        {label}
      </button>
    );
  }

  /* ===============================
     DERIVED DATA
  ================================ */

  const sortedCompanies = useMemo(() => {
    return [...stats.top_companies].sort(
      (a, b) => (b as any)[mode] - (a as any)[mode]
    );
  }, [stats.top_companies, mode]);

  const sortedTopics = useMemo(() => {
    return [...stats.top_topics].sort(
      (a, b) => (b as any)[mode] - (a as any)[mode]
    );
  }, [stats.top_topics, mode]);

  const sortedTypes = useMemo(() => {
    return [...stats.top_types].sort(
      (a, b) => (b as any)[mode] - (a as any)[mode]
    );
  }, [stats.top_types, mode]);

  const members = sortedCompanies.filter((c) => c.is_partner);
  const others = sortedCompanies.filter((c) => !c.is_partner);

  /* ===============================
     RENDER
  ================================ */

  return (
    <section className="border-b border-gray-200 pb-6 mb-6 space-y-6">

      {/* AXIS SWITCH */}
      <div className="flex justify-between items-center">

        <div className="flex gap-8 text-sm font-medium">
          {["companies", "topics", "types"].map((a) => (
            <button
              key={a}
              onClick={() => setAxis(a as any)}
              className={`transition ${
                axis === a
                  ? "text-black"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {a === "companies"
                ? "Acteurs"
                : a === "topics"
                ? "Thématiques"
                : "Types"}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          <SwitchButton value="total" label="Total" />
          <SwitchButton value="last_7_days" label="7j" />
          <SwitchButton value="last_30_days" label="30j" />
        </div>

      </div>

      {/* ================= ACTEURS ================= */}
      {axis === "companies" && (
        <div className="space-y-5">

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((c) => {
                const active = selectedCompanies.includes(
                  c.id_company
                );
                return (
                  <button
                    key={c.id_company}
                    onClick={() =>
                      toggleFilter("companies", c.id_company)
                    }
                    className={`px-3 py-1 text-xs rounded-full transition
                      ${
                        active
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                  >
                    {c.name} {(c as any)[mode]}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setOpenOthers(!openOthers)}
            className="text-xs uppercase tracking-wider text-gray-400 hover:text-black"
          >
            {openOthers
              ? "Masquer autres acteurs"
              : "Afficher autres acteurs"}
          </button>

          {openOthers && (
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              {others.map((c) => {
                const active = selectedCompanies.includes(
                  c.id_company
                );
                return (
                  <button
                    key={c.id_company}
                    onClick={() =>
                      toggleFilter("companies", c.id_company)
                    }
                    className={`flex justify-between border-b pb-1 transition
                      ${
                        active
                          ? "text-black font-semibold"
                          : "text-gray-600 hover:text-black"
                      }`}
                  >
                    <span>{c.name}</span>
                    <span>{(c as any)[mode]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TOPICS ================= */}
      {axis === "topics" && (
        <div className="flex flex-wrap gap-2">
          {sortedTopics.slice(0, 20).map((t) => {
            const active = selectedTopics.includes(
              t.id_topic
            );
            return (
              <button
                key={t.id_topic}
                onClick={() =>
                  toggleFilter("topics", t.id_topic)
                }
                className={`px-3 py-1 text-xs rounded-full transition
                  ${
                    active
                      ? "bg-black text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {t.label} {(t as any)[mode]}
              </button>
            );
          })}
        </div>
      )}

      {/* ================= TYPES ================= */}
      {axis === "types" && (
        <div className="flex flex-wrap gap-2">
          {sortedTypes.map((t) => {
            const active = selectedTypes.includes(
              t.news_type
            );
            return (
              <button
                key={t.news_type}
                onClick={() =>
                  toggleFilter("news_types", t.news_type)
                }
                className={`px-3 py-1 text-xs rounded-full transition
                  ${
                    active
                      ? "bg-violet-600 text-white"
                      : "bg-violet-100 text-violet-700"
                  }`}
              >
                {t.news_type} {(t as any)[mode]}
              </button>
            );
          })}
        </div>
      )}

    </section>
  );
}
