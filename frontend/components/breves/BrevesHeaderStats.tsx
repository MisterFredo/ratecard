"use client";

import { useEffect, useState } from "react";
import { Period } from "@/app/breves/page";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type StatsResponse = {
  total_count: number;
  last_7_days: number;
  last_30_days: number;
};

export default function BrevesHeaderStats({
  selectedPeriod,
  onChangePeriod,
}: {
  selectedPeriod: Period;
  onChangePeriod: (p: Period) => void;
}) {
  const [stats, setStats] =
    useState<StatsResponse | null>(null);

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

  const mainValue =
    selectedPeriod === "total"
      ? stats.total_count
      : selectedPeriod === "7d"
      ? stats.last_7_days
      : stats.last_30_days;

  return (
    <section className="border-b pb-6">

      <div className="flex justify-between items-end">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Signaux marché
          </h1>

          <div className="flex gap-6 mt-4 text-xs uppercase tracking-wider">

            <SwapButton
              label="Total"
              active={selectedPeriod === "total"}
              onClick={() =>
                onChangePeriod("total")
              }
            />

            <SwapButton
              label="7 jours"
              active={selectedPeriod === "7d"}
              onClick={() =>
                onChangePeriod("7d")
              }
            />

            <SwapButton
              label="30 jours"
              active={selectedPeriod === "30d"}
              onClick={() =>
                onChangePeriod("30d")
              }
            />

          </div>
        </div>

        <div className="text-5xl font-serif tracking-tight">
          {mainValue}
        </div>

      </div>
    </section>
  );
}

function SwapButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-1 border-b ${
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}
