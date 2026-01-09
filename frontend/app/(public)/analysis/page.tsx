"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AnalysisItem = {
  id: string;
  title: string;
  excerpt?: string;
  published_at: string;
  topics?: string[];
  key_metrics?: string[];
  event: {
    id: string;
    label: string;
    event_color?: string;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/public/analysis/list`)
      .then((r) => r.json())
      .then((json) => setAnalyses(json.items || []));
  }, []);

  const events = useMemo(() => {
    const map = new Map();
    analyses.forEach((a) => map.set(a.event.id, a.event));
    return Array.from(map.values());
  }, [analyses]);

  const filtered = activeEvent
    ? analyses.filter((a) => a.event.id === activeEvent)
    : analyses;

  return (
    <div className="space-y-12">

      <h1 className="text-3xl font-bold">Analyses</h1>

      {/* FILTRE */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveEvent(null)}
          className="px-3 py-1 rounded-full border"
        >
          Toutes
        </button>

        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => setActiveEvent(e.id)}
            className="px-3 py-1 rounded-full border"
            style={{ borderColor: e.event_color }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {filtered.length === 0 ? (
        <p>Aucune analyse.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((a) => (
            <li key={a.id} className="border p-4 rounded">
              <Link href={`/analysis/${a.id}`}>
                <h2 className="font-semibold">{a.title}</h2>
                {a.excerpt && <p>{a.excerpt}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
