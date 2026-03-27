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

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.ID_INSIGHT)
  );

  /* ========================================================= */

  async function generate() {
    if (!selectedItems.length) return;

    setLoading(true);

    try {
      const res: any = await api.post("/radars/insight", {
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
      <div className="flex-1 overflow-auto p-4 space-y-6">

        {/* SELECTED */}
        <div className="space-y-4">
          {selectedItems.map((item) => (
            <div
              key={item.ID_INSIGHT}
              className="text-xs border-b pb-3"
            >
              {/* ENTITY */}
              <div className="font-semibold text-gray-900">
                {item.ENTITY_LABEL}
              </div>

              {/* DATE */}
              <div className="text-gray-400 mb-1">
                {formatRadarLabel(item)}
              </div>

              {/* PREVIEW */}
              <ul className="space-y-1">
                {(item.KEY_POINTS || []).slice(0, 2).map((p: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    • {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RESULT */}
        <div className="pt-4 border-t">

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
