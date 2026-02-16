"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type CompanyMover = {
  id_company: string;
  name: string;
  total: number;
  last_7_days: number;
  last_30_days: number;
};

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
  top_companies: CompanyMover[];
};

export default function BrevesHeaderStats() {
  const [stats, setStats] = useState<StatsResponse>({
    total_count: 0,
    last_7_days: 0,
    last_30_days: 0,
    top_companies: [],
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

  const movers7 = [...stats.top_companies]
    .sort((a, b) => b.last_7_days - a.last_7_days)
    .slice(0, 3);

  const movers30 = [...stats.top_companies]
    .sort((a, b) => b.last_30_days - a.last_30_days)
    .slice(0, 3);

  return (
    <section className="border-b border-black pb-12 mb-12">

      <div className="flex justify-between items-start">

        {/* LEFT — TITLE */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-serif leading-tight">
            Signaux marché
          </h1>
          <p className="text-sm text-gray-600 mt-4">
            Lecture structurée des annonces, mouvements et arbitrages
            du marché.
          </p>
        </div>

        {/* RIGHT — CORE STATS */}
        <div className="flex gap-16 text-right">
          <StatBlock
            label="Total"
            value={stats.total_count}
          />
          <StatBlock
            label="7 jours"
            value={stats.last_7_days}
            highlight
          />
          <StatBlock
            label="30 jours"
            value={stats.last_30_days}
          />
        </div>
      </div>

      {/* MOVERS SECTION */}
      <div className="mt-10 grid grid-cols-2 gap-16 text-sm">

        <MoversBlock
          title="Plus actifs — 7 jours"
          movers={movers7}
          period="last_7_days"
        />

        <MoversBlock
          title="Plus actifs — 30 jours"
          movers={movers30}
          period="last_30_days"
        />

      </div>
    </section>
  );
}

function StatBlock({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-4xl font-serif ${
          highlight ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
        {label}
      </div>
    </div>
  );
}

function MoversBlock({
  title,
  movers,
  period,
}: {
  title: string;
  movers: any[];
  period: "last_7_days" | "last_30_days";
}) {
  return (
    <div>
      <h3 className="uppercase text-xs tracking-wider text-gray-500 mb-4">
        {title}
      </h3>

      <div className="space-y-2">
        {movers.map((m) => (
          <div
            key={m.id_company}
            className="flex justify-between border-b pb-2"
          >
            <span className="font-medium">
              {m.name}
            </span>
            <span className="font-serif">
              {m[period]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

