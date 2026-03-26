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
  if (item.value === undefined || item.value === null) return "";

  const scaleMap: any = {
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[item.scale || ""] || "";
  const unit = item.unit || "";

  return `${item.value}${scale}${unit}`;
}

/* ========================================================= */

export default function NumbersSelectionPanel({
  items,
  selectedIds,
  onClose,
}: Props) {

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id_number)
  );

  /* ========================================================= */

  async function generate() {
    if (!selectedItems.length) return;

    setLoading(true);

    try {
      const res: any = await api.post("/numbers/insight", {
        ids: selectedItems.map((i) => i.id_number),
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
              key={item.id_number}
              className="text-xs border-b pb-2"
            >
              <div className="font-semibold text-gray-900">
                {formatValue(item)}
              </div>

              <div className="text-gray-700">
                {item.label}
              </div>

              <div className="text-gray-400">
                {item.type} — {item.category}
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
