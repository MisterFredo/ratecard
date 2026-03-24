"use client";

import { useState } from "react";
import type { FeedItem } from "@/types/feed";

type Props = {
  items: FeedItem[];
  selectedIds: string[];

  finalEmail: string;
  html?: string;

  loading: boolean;

  onGeneratePreview: () => void;
  onGenerateInsight: () => void;
};

export default function SelectionPanel({
  items,
  selectedIds,
  finalEmail,
  html,
  loading,
  onGeneratePreview,
  onGenerateInsight,
}: Props) {

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id)
  );

  const [mode, setMode] = useState<"preview" | "insight">("preview");

  function handleGenerate() {
    if (mode === "preview") onGeneratePreview();
    else onGenerateInsight();
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(html || finalEmail);
  }

  return (
    <div className="h-full flex flex-col">

      {/* =====================================================
         HEADER (FIXE)
      ===================================================== */}
      <div className="flex items-center justify-between pb-3 border-b">

        <h2 className="text-sm font-semibold">
          Sélection ({selectedItems.length})
        </h2>

        <div className="flex items-center gap-3">

          {/* MODE */}
          <div className="flex border rounded overflow-hidden text-xs">
            <button
              onClick={() => setMode("preview")}
              className={`px-3 py-1.5 ${
                mode === "preview"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              Preview
            </button>

            <button
              onClick={() => setMode("insight")}
              className={`px-3 py-1.5 border-l ${
                mode === "insight"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              Insight
            </button>
          </div>

          {/* ACTION */}
          <button
            onClick={handleGenerate}
            disabled={loading || selectedItems.length === 0}
            className="px-3 py-1.5 rounded bg-black text-white text-xs disabled:opacity-50"
          >
            Générer
          </button>
        </div>
      </div>

      {/* =====================================================
         OUTPUT (ZONE PRINCIPALE)
      ===================================================== */}
      <div className="flex-1 flex flex-col overflow-hidden mt-4 border rounded-xl bg-white">

        {/* HEADER OUTPUT */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-medium text-gray-700">
            Résultat
          </span>

          {(html || finalEmail) && (
            <button
              onClick={copyToClipboard}
              className="text-xs text-blue-600"
            >
              Copier
            </button>
          )}
        </div>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-auto">

          {loading && (
            <div className="p-4 text-sm text-gray-500 animate-pulse">
              Génération en cours...
            </div>
          )}

          {!loading && !html && !finalEmail && (
            <div className="p-4 text-sm text-gray-400">
              Génère une sélection pour voir le rendu.
            </div>
          )}

          {/* 🔥 HTML RENDER PREMIUM */}
          {!loading && html && (
            <div className="max-w-[680px] mx-auto p-6">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}

          {/* fallback */}
          {!loading && !html && finalEmail && (
            <div className="p-6 whitespace-pre-wrap text-sm text-gray-700">
              {finalEmail}
            </div>
          )}

        </div>
      </div>

      {/* =====================================================
         LIST (SECONDARY - NE CASSE PLUS L'UX)
      ===================================================== */}
      {selectedItems.length > 0 && (
        <div className="mt-4 border rounded-lg p-2 max-h-[140px] overflow-auto bg-gray-50">

          <div className="text-[10px] text-gray-400 mb-2">
            Contenus sélectionnés
          </div>

          <div className="space-y-1">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="text-xs text-gray-700 truncate"
              >
                • {item.title}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
