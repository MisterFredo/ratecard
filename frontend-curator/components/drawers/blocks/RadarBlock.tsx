"use client";

import { useDrawer } from "@/contexts/DrawerContext";

/* ========================================================= */

type Radar = {
  id_insight: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  key_points: string[];
};

/* ========================================================= */

function formatRadarLabel(r: Radar) {
  if (r.frequency === "MONTHLY") {
    const date = new Date(r.year, r.period - 1);
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  if (r.frequency === "QUARTERLY") {
    return `T${r.period} ${r.year}`;
  }

  if (r.frequency === "WEEKLY") {
    return `Semaine ${r.period} ${r.year}`;
  }

  return "";
}

/* ========================================================= */

export default function RadarBlock({ radar }: { radar: Radar | null }) {
  const { openRightDrawer } = useDrawer();

  if (!radar) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase text-gray-400">
        Veille
      </h2>

      <button
        onClick={() =>
          openRightDrawer("radar", radar.id_insight)
        }
        className="w-full text-left p-4 rounded border border-gray-200 hover:bg-gray-50 transition"
      >
        <div className="text-xs text-gray-500 mb-2">
          {formatRadarLabel(radar)}
        </div>

        <div className="text-sm text-gray-900 space-y-1">
          {radar.key_points?.slice(0, 2).map((p, i) => (
            <div key={i}>• {p}</div>
          ))}
        </div>

        <div className="text-xs text-gray-400 mt-3">
          Voir la veille complète →
        </div>
      </button>
    </section>
  );
}
