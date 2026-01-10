"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const { openDrawer } = useDrawer();

  useEffect(() => {
    fetchAnalyses().then(setAnalyses);
  }, []);

  /* -------------------------------------------------------
     GROUP BY EVENT
  -------------------------------------------------------- */
  const events = useMemo(() => {
    const map = new Map<
      string,
      { event: AnalysisItem["event"]; analyses: AnalysisItem[] }
    >();

    analyses.forEach((a) => {
      if (activeEvent && a.event.id !== activeEvent) {
        return;
      }

      if (!map.has(a.event.id)) {
        map.set(a.event.id, {
          event: a.event,
          analyses: [],
        });
      }
      map.get(a.event.id)!.analyses.push(a);
    });

    return Array.from(map.values());
  }, [analyses, activeEvent]);

  /* -------------------------------------------------------
     EVENTS FOR FILTER
  -------------------------------------------------------- */
  const eventFilters = useMemo(() => {
    const map = new Map<string, AnalysisItem["event"]>();
    analyses.forEach((a) => map.set(a.event.id, a.event));
    return Array.from(map.values());
  }, [analyses]);

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
          EVENT FILTER (PILLS)
      ===================================================== */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveEvent(null)}
          className={`px-3 py-1 text-sm rounded-full border ${
            activeEvent === null
              ? "bg-ratecard-blue text-white border-ratecard-blue"
              : "border-ratecard-border text-gray-600"
          }`}
        >
          Toutes
        </button>

        {eventFilters.map((e) => (
          <button
            key={e.id}
            onClick={() => setActiveEvent(e.id)}
            className={`px-3 py-1 text-sm rounded-full border ${
              activeEvent === e.id
                ? "text-white"
                : "text-gray-600"
            }`}
            style={{
              backgroundColor:
                activeEvent === e.id
                  ? e.event_color || "#9CA3AF"
                  : "transparent",
              borderColor:
                e.event_color || "#E5E7EB",
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* =====================================================
          ANALYSES — DRAWER ADEX-LIKE
      ===================================================== */}
      <div className="space-y-8">
        {events.map(({ event, analyses }) => (
          <div
            key={event.id}
            className="
              relative rounded-2xl border border-ratecard-border
              bg-white p-4 md:p-5
            "
          >
            {/* EVENT COLOR BAR */}
            <span
              className="absolute left-0 top-5 bottom-5 w-1 rounded-full"
              style={{
                backgroundColor:
                  event.event_color || "#9CA3AF",
              }}
            />

            <div className="pl-4 max-w-3xl">
              {/* EVENT HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      event.event_color || "#9CA3AF",
                  }}
                />
                <h3 className="font-semibold text-gray-900">
                  {event.label}
                </h3>
              </div>

              {/* ANALYSES LIST */}
              <ul className="space-y-3">
                {analyses.map((a) => (
                  <li
                    key={a.id}
                    onClick={() =>
                      openDrawer("analysis", a.id)
                    }
                    className="
                      cursor-pointer pl-4 border-l border-ratecard-border
                      hover:border-gray-400 transition-colors
                    "
                  >
                    {/* TITLE */}
                    <p className="text-sm font-medium text-gray-900 hover:underline">
                      {a.title}
                    </p>

                    {/* META */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {a.topics?.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded bg-ratecard-light text-gray-600"
                        >
                          {t}
                        </span>
                      ))}

                      {a.key_metrics?.slice(0, 2).map((m, i) => (
                        <span
                          key={i}
                          className="text-xs text-gray-500"
                        >
                          • {m}
                        </span>
                      ))}

                      <span className="text-xs text-gray-400">
                        {new Date(
                          a.published_at
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {/* EXCERPT */}
                    {a.excerpt && (
                      <p className="text-sm text-gray-600 mt-1 max-w-3xl">
                        {a.excerpt}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
