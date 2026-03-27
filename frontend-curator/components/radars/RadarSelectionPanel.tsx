"use client";

import { useState } from "react";
import { api } from "@/lib/api";

/* ========================================================= */

type Props = {
  items: any[];
  selectedIds: string[];
  onClose: () => void;
};

/* ========================================================= */

function formatRadarLabel(r: any) {
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

export default function RadarSelectionPanel({
  items,
  selectedIds,
  onClose,
}: Props) {

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  /* NEW */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.ID_INSIGHT)
  );

  /* ========================================================= */

  async function generate() {
    if (!selectedItems.length) return;

    setLoading(true);

    try {
      const res: any = await api.post("/radar/insight", {
        ids: selectedItems.map((i) => i.ID_INSIGHT),
      });

      setAnalysis(res.insight || "");

    } catch (e) {
      console.error("❌ radar insight error", e);
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================= */

  function copy() {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
  }

  /* ========================================================= */

  return (
    <div className="h-full flex flex-col bg-white border rounded-xl overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Sélection
          </div>
          <div className="text-xs text-gray-400">
            {selectedItems.length} veille(s)
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* ACTIONS */}
      <div className="p-3 border-b flex gap-2">
        <button
          onClick={generate}
          disabled={loading || selectedItems.length === 0}
          className="flex-1 py-2 text-xs rounded-lg bg-black text-white disabled:opacity-50"
        >
          Analyser
        </button>

        <button
          onClick={copy}
          disabled={!analysis}
          className="px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700"
        >
          Copier
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-4 space-y-4">

        {/* SELECTED */}
        <div className="space-y-4">
          {selectedItems.map((item) => {

            const isExpanded = expanded[item.ID_INSIGHT];
            const points = item.KEY_POINTS || [];

            const visiblePoints = isExpanded
              ? points
              : points.slice(0, 2);

            return (
              <div
                key={item.ID_INSIGHT}
                className="text-xs border-b pb-3 space-y-2"
              >
                {/* ENTITY */}
                <div className="font-semibold text-gray-900">
                  {item.ENTITY_LABEL}
                </div>

                {/* DATE */}
                <div className="text-gray-400">
                  {formatRadarLabel(item)}
                </div>

                {/* POINTS */}
                <ul className="space-y-1">
                  {visiblePoints.map((p: string, i: number) => (
                    <li key={i} className="text-gray-700">
                      • {p}
                    </li>
                  ))}
                </ul>

                {/* TOGGLE */}
                {points.length > 2 && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [item.ID_INSIGHT]: !prev[item.ID_INSIGHT],
                      }))
                    }
                    className="text-[11px] text-gray-400 hover:text-gray-700"
                  >
                    {isExpanded ? "Voir moins ↑" : "Voir plus →"}
                  </button>
                )}

              </div>
            );
          })}
        </div>

        {/* RESULT */}
        <div className="pt-3 border-t">

          {loading && (
            <div className="text-xs text-gray-400">
              Analyse en cours...
            </div>
          )}

          {!loading && !analysis && (
            <div className="text-xs text-gray-400">
              Clique sur "Analyser"
            </div>
          )}

          {!loading && analysis && (
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
