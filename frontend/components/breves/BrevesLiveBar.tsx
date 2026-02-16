"use client";

import { useEffect, useState } from "react";
import { Period } from "@/app/breves/page";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type Stats = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

export default function BrevesLiveBar({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const [stats, setStats] = useState<Stats | null>(null);

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

  if (!stats) return null;

  const value =
    selectedPeriod === "total"
      ? stats.total_count
      : selectedPeriod === "7d"
      ? stats.last_7_days
      : stats.last_30_days;

  return (
    <div className="border-b bg-gray-50 text-xs tracking-wide text-gray-600">
      <div className="max-w-6xl mx-auto px-8 py-2 flex justify-between">

        <div>
          RATECARD MARKETS
        </div>

        <div className="flex gap-6">
          <span>
            TOTAL {stats.total_count}
          </span>
          <span className="text-green-600">
            7J {stats.last_7_days}
          </span>
          <span>
            30J {stats.last_30_days}
          </span>
        </div>

      </div>
    </div>
  );
}
