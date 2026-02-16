"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

export default function BrevesHeaderStats() {
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
    <section className="border-b pb-10">

      <div className="flex items-end justify-between">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Signaux marché
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Flux structuré des annonces et mouvements du secteur
          </p>
        </div>

        <div className="flex gap-12 text-right">
          <StatBlock label="Total" value={stats.total_count} />
          <StatBlock label="7 jours" value={stats.last_7_days} />
          <StatBlock label="30 jours" value={stats.last_30_days} />
        </div>

      </div>
    </section>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-3xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}
