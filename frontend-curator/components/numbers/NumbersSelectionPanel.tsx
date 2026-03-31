"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  items: any[];
  selectedIds: string[];
  onClose: () => void;
};

/* ========================================================= */

function formatValue(item: any) {
  if (item.VALUE === undefined || item.VALUE === null) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[item.SCALE || ""] || "";
  const unit = item.UNIT || "";

  return [item.VALUE, scale, unit]
    .filter(Boolean)
    .join(" ");
}

/* ========================================================= */

export default function NumbersSelectionPanel({
  items,
  selectedIds,
  onClose,
}: Props) {

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ FIX ICI */
  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.ID_NUMBER)
  );

  /* ========================================================= */

  async function generate() {
    if (!selectedItems.length) return;

    setLoading(true);

    try {
      const res: any = await api.post("/numbers/insight", {
        ids: selectedItems.map((i) => i.ID_NUMBER),
      });

      setAnalysis(res.insight || "");

    } catch (e) {
      console.error("❌ numbers insight error", e);
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
            {selectedItems.length} chiffre(s)
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
          Structurer
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
        <div className="space-y-3">
          {selectedItems.map((item) => (
            <div
              key={item.ID_NUMBER}
              className="text-xs border-b pb-2"
            >
              <div className="font-semibold text-gray-900">
                {formatValue(item)}
              </div>

              <div className="text-gray-700">
                {item.LABEL}
              </div>

              <div className="text-gray-400">
                {item.TYPE} — {item.CATEGORY}
              </div>
            </div>
          ))}
        </div>

        {/* RESULT */}
        <div className="pt-4 border-t">

          {loading && (
            <div className="text-xs text-gray-400">
              Génération...
            </div>
          )}

          {!loading && !analysis && (
            <div className="text-xs text-gray-400">
              Clique sur "Structurer"
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
