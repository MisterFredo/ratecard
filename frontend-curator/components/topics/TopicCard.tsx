"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  onClick: () => void;
};

type Metrics = {
  total_analyses: number;
  last_30_days: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function TopicCard({ label, onClick }: Props) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);

      try {
        const res = await fetch(
          `${API_BASE}/content/overview?topic_id=${encodeURIComponent(label)}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const json = await res.json();
          setMetrics({
            total_analyses: json.total_analyses,
            last_30_days: json.last_30_days,
          });
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    loadMetrics();
  }, [label]);

  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        rounded-xl
        border
        bg-white
        p-5
        transition
        hover:shadow-md
        hover:border-gray-300
      "
    >
      {/* TITLE */}
      <h3 className="text-lg font-semibold">
        {label}
      </h3>

      {/* METRICS */}
      <div className="mt-4 text-sm text-gray-600 space-y-1">
        {loading && (
          <span className="text-gray-400">
            Chargement…
          </span>
        )}

        {!loading && metrics && (
          <>
            <div>
              {metrics.total_analyses} analyses
            </div>
            <div className="text-xs text-gray-500">
              +{metrics.last_30_days} sur 30j
            </div>
          </>
        )}
      </div>
    </div>
  );
}
