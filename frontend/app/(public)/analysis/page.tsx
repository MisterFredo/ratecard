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
    <div className="space-y-12">

      {/* =====================================================
          ANALYSES — GRILLE
      ===================================================== */}
      <div
        className="
          grid grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >
        {analyses.map((a) => (
          <article
            key={a.id}
            onClick={() => openDrawer("analysis", a.id)}
            className="
              cursor-pointer rounded-2xl
              border border-ratecard-border bg-white
              p-5 hover:border-gray-400 transition-colors
              flex flex-col
            "
          >
            {/* EVENT BADGE */}
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    a.event.event_color || "#9CA3AF",
                }}
              />
              <span className="font-medium">
                {a.event.label}
              </span>
            </div>

            {/* TITLE */}
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {a.title}
            </h3>

            {/* EXCERPT */}
            {a.excerpt && (
              <p className="text-sm text-gray-600 mt-2">
                {a.excerpt}
              </p>
            )}

            {/* META */}
            <div className="mt-auto pt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {a.topics?.[0] && (
                <span className="px-2 py-0.5 rounded bg-ratecard-light text-gray-600">
                  {a.topics[0]}
                </span>
              )}

              {a.key_metrics?.[0] && (
                <span>• {a.key_metrics[0]}</span>
              )}

              <span className="text-gray-400">
                {new Date(
                  a.published_at
                ).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
