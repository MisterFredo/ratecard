"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "@/contexts/DrawerContext";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   FETCH
========================================================= */

async function fetchAnalyses(): Promise<AnalysisItem[]> {
  const res = await fetch(
    `${API_BASE}/public/analysis/list`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.items || [];
}

/* =========================================================
   PAGE
========================================================= */

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const { openDrawer } = useDrawer();

  useEffect(() => {
    fetchAnalyses().then(setAnalyses);
  }, []);

  return (
    <div className="space-y-14 md:space-y-16">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Analyses
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Lectures Ratecard issues des événements et signaux du marché.
        </p>
      </section>

      {/* =====================================================
          ANALYSES — FLUX CHRONOLOGIQUE
      ===================================================== */}
      <div className="space-y-6">
        {analyses.map((a) => (
          <div
            key={a.id}
            onClick={() => openDrawer("analysis", a.id)}
            className="
              cursor-pointer relative rounded-2xl
              border border-ratecard-border bg-white
              p-5 hover:border-gray-400 transition-colors
            "
          >
            {/* EVENT COLOR BAR */}
            <span
              className="absolute left-0 top-5 bottom-5 w-1 rounded-full"
              style={{
                backgroundColor:
                  a.event.event_color || "#9CA3AF",
              }}
            />

            <div className="pl-4 max-w-4xl">
              {/* TITLE */}
              <h3 className="text-lg font-semibold text-gray-900 leading-snug">
                {a.title}
              </h3>

              {/* EXCERPT */}
              {a.excerpt && (
                <p className="text-sm text-gray-600 mt-2">
                  {a.excerpt}
                </p>
              )}

              {/* META */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                {/* EVENT */}
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        a.event.event_color || "#9CA3AF",
                    }}
                  />
                  {a.event.label}
                </span>

                {/* TOPIC */}
                {a.topics?.[0] && (
                  <span className="px-2 py-0.5 rounded bg-ratecard-light text-gray-600">
                    {a.topics[0]}
                  </span>
                )}

                {/* KEY METRIC */}
                {a.key_metrics?.[0] && (
                  <span>• {a.key_metrics[0]}</span>
                )}

                {/* DATE */}
                <span className="text-gray-400">
                  {new Date(
                    a.published_at
                  ).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
