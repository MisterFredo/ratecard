"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Period } from "@/components/breves/BrevesHeaderStats";

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
  top_companies: CompanyStat[];
  topics_stats: TopicStat[];
  types_stats: TypeStat[];
};

type Mode = "actors" | "topics" | "types";

type Props = {
  selectedPeriod: Period;
};

export default function BrevesSwitcher({ selectedPeriod }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("actors");
  const [stats, setStats] = useState<StatsResponse>({
    top_companies: [],
    topics_stats: [],
    types_stats: [],
  });

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

  function periodValue(obj: any) {
    if (selectedPeriod === "7d") return obj.last_7_days;
    if (selectedPeriod === "30d") return obj.last_30_days;
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

  const sortedActors = useMemo(() => {
    return [...stats.top_companies].sort(
      (a, b) => periodValue(b) - periodValue(a)
    );
  }, [stats, selectedPeriod]);

  const sortedTopics = useMemo(() => {
    return [...stats.topics_stats].sort(
      (a, b) => periodValue(b) - periodValue(a)
    );
  }, [stats, selectedPeriod]);

  const sortedTypes = useMemo(() => {
    return [...stats.types_stats].sort(
      (a, b) => periodValue(b) - periodValue(a)
    );
  }, [stats, selectedPeriod]);

  return (
    <section className="border-b border-gray-200 pb-6">

      {/* MODE SWITCH */}
      <div className="flex gap-8 text-xs uppercase tracking-wider mb-6">
        <ModeButton active={mode === "actors"} onClick={() => setMode("actors")}>
          Acteurs
        </ModeButton>
        <ModeButton active={mode === "topics"} onClick={() => setMode("topics")}>
          Topics
        </ModeButton>
        <ModeButton active={mode === "types"} onClick={() => setMode("types")}>
          Types
        </ModeButton>
      </div>

      {/* CONTENT */}
      <div className="flex flex-wrap gap-3">

        {mode === "actors" &&
          sortedActors.slice(0, 20).map((c) => (
            <button
              key={c.id_company}
              onClick={() => toggleFilter("companies", c.id_company)}
              className={`px-3 py-1 text-xs rounded-full border transition
                ${
                  c.is_partner
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {c.name}{" "}
              <span className="ml-1 font-semibold">
                {periodValue(c)}
              </span>
            </button>
          ))}

        {mode === "topics" &&
          sortedTopics.slice(0, 20).map((t) => (
            <button
              key={t.id_topic}
              onClick={() => toggleFilter("topics", t.id_topic)}
              className="px-3 py-1 text-xs rounded-full border border-green-200 bg-green-50"
            >
              {t.label}{" "}
              <span className="ml-1 font-semibold">
                {periodValue(t)}
              </span>
            </button>
          ))}

        {mode === "types" &&
          sortedTypes
            .filter((t) => t.news_type)
            .slice(0, 15)
            .map((t) => (
              <button
                key={t.news_type}
                onClick={() =>
                  toggleFilter("news_types", t.news_type!)
                }
                className="px-3 py-1 text-xs rounded-full border border-violet-200 bg-violet-50"
              >
                {t.news_type}{" "}
                <span className="ml-1 font-semibold">
                  {periodValue(t)}
                </span>
              </button>
            ))}

      </div>

    </section>
  );
}

function ModeButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`transition ${
        active
          ? "text-black font-semibold"
          : "text-gray-400 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}
