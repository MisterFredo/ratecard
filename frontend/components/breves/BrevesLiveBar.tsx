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
    <div className="border-b bg-neutral-50">
      <div className="max-w-6xl mx-auto px-8 py-3 flex justify-between text-xs tracking-wide text-gray-600">

        <div className="flex gap-8">
          <span>
            TOTAL&nbsp;
            <strong className="text-black">
              {stats.total_count}
            </strong>
          </span>

          <span>
            7J&nbsp;
            <strong className="text-black">
              {stats.last_7_days}
            </strong>
          </span>

          <span>
            30J&nbsp;
            <strong className="text-black">
              {stats.last_30_days}
            </strong>
          </span>
        </div>

        <div className="text-gray-400">
          Market monitoring · Ratecard
        </div>

      </div>
    </div>
  );
}
