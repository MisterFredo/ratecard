"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
  news_type: string | null;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
  top_companies: CompanyStat[];
  topics_stats: TopicStat[];
  types_stats: TypeStat[];
};

type Mode = "actors" | "topics" | "types";
type Period = "total" | "30d" | "7d";

export default function BrevesSwitcher() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("actors");
  const [period, setPeriod] = useState<Period>("30d");
  const [openOthers, setOpenOthers] = useState(false);

  const [stats, setStats] = useState<StatsResponse>({
    total_count: 0,
    last_7_days: 0,
    last_30_days: 0,
    top_companies: [],
    topics_stats: [],
    types_stats: [],
  });

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/news/breves/stats`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setStats(json);
    }
    load();
  }, []);

  function periodValue(obj: any) {
    if (period === "7d") return obj.last_7_days;
    if (period === "30d") return obj.last_30_days;
    return obj.total;
  }

  function toggleFilter(
    key: "companies" | "topics" | "news_types",
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

  const selectedCompanies = searchParams.getAll("companies");
  const selectedTopics = searchParams.getAll("topics");
  const selectedTypes = searchParams.getAll("news_types");

  const sortedActors = useMemo(
    () =>
      [...stats.top_companies].sort(
        (a, b) => periodValue(b) - periodValue(a)
      ),
    [stats, period]
  );

  const members = sortedActors.filter((c) => c.is_partner);
  const others = sortedActors.filter((c) => !c.is_partner);

  const sortedTopics = useMemo(
    () =>
      [...stats.topics_stats].sort(
        (a, b) => periodValue(b) - periodValue(a)
      ),
    [stats, period]
  );

  const sortedTypes = useMemo(
    () =>
      [...stats.types_stats].sort(
        (a, b) => periodValue(b) - periodValue(a)
      ),
    [stats, period]
  );

  return (
    <section className="border-b border-gray-200 pb-4 space-y-4">

      {/* ===================== */}
      {/* GLOBAL STATS */}
      {/* ===================== */}
      <div className="flex justify-between items-center text-sm">

        <div className="text-gray-600">
          <span className="font-semibold text-black">
            {stats.total_count}
          </span>{" "}
          signaux au total
        </div>

        <div className="flex gap-6 text-xs uppercase tracking-wide">

          <button
            onClick={() => setPeriod("total")}
            className={`transition ${
              period === "total"
                ? "text-black font-semibold"
                : "text-gray-400 hover:text-black"
            }`}
          >
            Total ({stats.total_count})
          </button>

          <button
            onClick={() => setPeriod("30d")}
            className={`transition ${
              period === "30d"
                ? "text-black font-semibold"
                : "text-gray-400 hover:text-black"
            }`}
          >
            30j ({stats.last_30_days})
          </button>

          <button
            onClick={() => setPeriod("7d")}
            className={`transition ${
              period === "7d"
                ? "text-black font-semibold"
                : "text-gray-400 hover:text-black"
            }`}
          >
            7j ({stats.last_7_days})
          </button>
        </div>
      </div>

      {/* ===================== */}
      {/* AXIS SWITCH */}
      {/* ===================== */}
      <div className="flex gap-6 text-sm font-medium">
        <ModeButton active={mode === "actors"} onClick={() => setMode("actors")}>
          Acteurs
        </ModeButton>
        <ModeButton active={mode === "topics"} onClick={() => setMode("topics")}>
          Thématiques
        </ModeButton>
        <ModeButton active={mode === "types"} onClick={() => setMode("types")}>
          Types
        </ModeButton>
      </div>

      {/* ===================== */}
      {/* FILTER LIST */}
      {/* ===================== */}
      <div className="space-y-3">

        {/* ACTORS */}
        {mode === "actors" && (
          <>
            {/* PARTNERS FIRST */}
            <div className="flex flex-wrap gap-2">
              {members.map((c) => {
                const active = selectedCompanies.includes(c.id_company);
                return (
                  <button
                    key={c.id_company}
                    onClick={() => toggleFilter("companies", c.id_company)}
                    className={`px-3 py-1 text-xs rounded border transition
                      ${
                        active
                          ? "bg-black text-white border-black"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      }`}
                  >
                    <span className="font-medium">
                      {c.name}
                    </span>
                    <span className="ml-2 font-semibold">
                      {periodValue(c)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* OTHER ACTORS */}
            <button
              onClick={() => setOpenOthers(!openOthers)}
              className="text-xs uppercase tracking-wide text-gray-400 hover:text-black"
            >
              {openOthers
                ? "Masquer autres acteurs"
                : "Afficher autres acteurs"}
            </button>

            {openOthers && (
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                {others.map((c) => {
                  const active = selectedCompanies.includes(c.id_company);
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
                      <span>{periodValue(c)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TOPICS */}
        {mode === "topics" && (
          <div className="flex flex-wrap gap-2">
            {sortedTopics.slice(0, 20).map((t) => {
              const active = selectedTopics.includes(t.id_topic);
              return (
                <button
                  key={t.id_topic}
                  onClick={() => toggleFilter("topics", t.id_topic)}
                  className={`px-3 py-1 text-xs rounded border transition
                    ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                >
                  {t.label}
                  <span className="ml-2 font-semibold">
                    {periodValue(t)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TYPES */}
        {mode === "types" && (
          <div className="flex flex-wrap gap-2">
            {sortedTypes
              .filter((t) => t.news_type)
              .slice(0, 15)
              .map((t) => {
                const active = selectedTypes.includes(t.news_type!);
                return (
                  <button
                    key={t.news_type!}
                    onClick={() =>
                      toggleFilter("news_types", t.news_type!)
                    }
                    className={`px-3 py-1 text-xs rounded border transition
                      ${
                        active
                          ? "bg-black text-white border-black"
                          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {t.news_type}
                      <span className="ml-2 font-semibold">
                        {periodValue(t)}
                      </span>
                    </button>
                  );
                })}
          </div>
        )}
      </div>
    </section>
  );
}

function ModeButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`transition ${
        active
          ? "text-black"
          : "text-gray-400 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}
