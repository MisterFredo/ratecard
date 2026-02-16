"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

type Mode = "total" | "7d" | "30d";

export default function BrevesHeaderStats() {
  const [stats, setStats] = useState<StatsResponse>({
    total_count: 0,
    last_7_days: 0,
    last_30_days: 0,
  });

  const [mode, setMode] = useState<Mode>("7d");

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

  return (
    <section className="border-b border-gray-200 pb-4">

      <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500">

        <div className="flex gap-6">

          <StatItem
            label="Total"
            value={stats.total_count}
            active={mode === "total"}
            onClick={() => setMode("total")}
          />

          <StatItem
            label="7J"
            value={stats.last_7_days}
            active={mode === "7d"}
            onClick={() => setMode("7d")}
          />

          <StatItem
            label="30J"
            value={stats.last_30_days}
            active={mode === "30d"}
            onClick={() => setMode("30d")}
          />

        </div>

        <div className="text-[11px] tracking-wide text-gray-400">
          Market monitoring · Ratecard
        </div>

      </div>

    </section>
  );
}

function StatItem({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-2 items-baseline transition ${
        active
          ? "text-black font-semibold"
          : "text-gray-400 hover:text-black"
      }`}
    >
      <span>{label}</span>
      <span className="font-medium text-sm">
        {value}
      </span>
    </button>
  );
}
