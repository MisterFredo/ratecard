"use client";

import { useEffect, useState } from "react";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type TimelinePoint = {
  period: string; // ex: "2025-10"
  count: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getScopeQuery(
  scopeType: "topic" | "company",
  scopeId: string
) {
  return scopeType === "topic"
    ? `topic_id=${encodeURIComponent(scopeId)}`
    : `company_id=${encodeURIComponent(scopeId)}`;
}

export default function DashboardTimeline({
  scopeType,
  scopeId,
}: Props) {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const scopeQuery = getScopeQuery(scopeType, scopeId);

      try {
        const res = await fetch(
          `${API_BASE}/analysis/timeline?${scopeQuery}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const json = await res.json();
          setTimeline(json.timeline || []);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    load();
  }, [scopeType, scopeId]);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        Historique
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Chargement de l’historique…
        </p>
      )}

      {!loading && timeline.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucun historique disponible pour ce périmètre.
        </p>
      )}

      {!loading && timeline.length > 0 && (
        <div className="space-y-2">
          {timeline.map((point) => (
            <div
              key={point.period}
              className="flex items-center justify-between border rounded px-4 py-2 bg-white"
            >
              <span className="text-sm">
                {formatPeriod(point.period)}
              </span>
              <span className="text-sm font-medium">
                {point.count} analyse{point.count > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   UTILS
========================================================= */

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
  });
}
