"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

export default function BrevesLiveBar() {
  const [stats, setStats] = useState<StatsResponse>({
    total_count: 0,
    last_7_days: 0,
    last_30_days: 0,
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

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-8 py-2 flex items-center justify-between text-[11px] tracking-wide text-gray-500">

        {/* LEFT — LIVE METRICS */}
        <div className="flex items-center gap-6">

          <LiveMetric
            label="Total"
            value={stats.total_count}
          />

          <LiveMetric
            label="7j"
            value={stats.last_7_days}
            highlight
          />

          <LiveMetric
            label="30j"
            value={stats.last_30_days}
          />

        </div>

        {/* RIGHT — SIGNATURE */}
        <div className="flex items-center gap-2 text-gray-400">

          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />

          <span className="uppercase tracking-widest">
            Live monitoring
          </span>

        </div>

      </div>
    </div>
  );
}

/* ========================= */

function LiveMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="uppercase text-gray-400">
        {label}
      </span>
      <strong
        className={`font-medium ${
          highlight ? "text-green-700" : "text-black"
        }`}
      >
        {value}
      </strong>
    </span>
  );
}
