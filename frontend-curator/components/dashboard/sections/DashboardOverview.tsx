"use client";

import { useEffect, useState } from "react";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type OverviewData = {
  total_analyses: number;
  last_30_days: number;
  last_90_days: number;
  delta_vs_previous_period: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function DashboardOverview({ scopeType, scopeId }: Props) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const params =
        scopeType === "topic"
          ? `topic_id=${encodeURIComponent(scopeId)}`
          : `company_id=${encodeURIComponent(scopeId)}`;

      try {
        const res = await fetch(
          `${API_BASE}/content/overview?${params}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Erreur chargement overview");
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger les indicateurs");
      }

      setLoading(false);
    }

    load();
  }, [scopeType, scopeId]);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        Vue d’ensemble
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des indicateurs…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Analyses"
            value={data.total_analyses}
          />
          <StatCard
            label="30 derniers jours"
            value={data.last_30_days}
          />
          <StatCard
            label="90 derniers jours"
            value={data.last_90_days}
          />
          <StatCard
            label="Évolution"
            value={
              data.delta_vs_previous_period >= 0
                ? `+${data.delta_vs_previous_period}`
                : data.delta_vs_previous_period
            }
          />
        </div>
      )}
    </section>
  );
}

/* =========================================================
   UI — CARD
========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">
        {value}
      </div>
    </div>
  );
}
