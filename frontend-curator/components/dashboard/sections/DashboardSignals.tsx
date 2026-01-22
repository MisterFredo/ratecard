"use client";

import { useEffect, useState } from "react";

type Props = {
  scopeType: "topic" | "company";
  scopeId: string;
};

type SignalItem = {
  label: string;
  frequency: number;
  trend?: string | null;
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

export default function DashboardSignals({
  scopeType,
  scopeId,
}: Props) {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const scopeQuery = getScopeQuery(scopeType, scopeId);

      try {
        const res = await fetch(
          `${API_BASE}/analysis/signals?${scopeQuery}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const json = await res.json();
          setSignals(json.signals || []);
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
        Signaux & patterns
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">
          Chargement des signaux…
        </p>
      )}

      {!loading && signals.length === 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Les signaux automatiques pour ce sujet
            seront bientôt disponibles.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Cette section exploitera l’agent expert
            et l’indexation sémantique.
          </p>
        </div>
      )}

      {!loading && signals.length > 0 && (
        <ul className="space-y-2">
          {signals.map((signal, idx) => (
            <li
              key={idx}
              className="border rounded p-3 bg-white"
            >
              <div className="font-medium">
                {signal.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Fréquence : {signal.frequency}
                {signal.trend && ` · Tendance : ${signal.trend}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
