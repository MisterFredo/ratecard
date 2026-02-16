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

  const [mode, setMode] = useState<"total" | "7d" | "30d">("7d");

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

  const value =
    mode === "total"
      ? stats.total_count
      : mode === "7d"
      ? stats.last_7_days
      : stats.last_30_days;

  return (
    <section className="border-b pb-8">

      <div className="flex justify-between items-end">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Signaux marché
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Lecture structurée des mouvements du secteur
          </p>
        </div>

        {/* SWITCH */}
        <div className="flex gap-6 text-xs uppercase tracking-wider">
          <button
            onClick={() => setMode("total")}
            className={mode === "total" ? "underline" : ""}
          >
            Total
          </button>

          <button
            onClick={() => setMode("7d")}
            className={mode === "7d" ? "underline" : ""}
          >
            7 jours
          </button>

          <button
            onClick={() => setMode("30d")}
            className={mode === "30d" ? "underline" : ""}
          >
            30 jours
          </button>
        </div>

      </div>

      <div className="mt-6 text-4xl font-serif">
        {value}
      </div>

    </section>
  );
}
