"use client";

import { useState } from "react";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[];
  selectedIds: string[];

  analysis: string;

  loading: boolean;

  onGenerateInsight: () => void;
  onClose: () => void;
};

/* ========================================================= */

export default function SelectionPanel({
  items,
  selectedIds,
  analysis,
  loading,
  onGenerateInsight,
  onClose,
}: Props) {

  const [tab, setTab] = useState<"selection" | "analysis">("selection");

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id)
  );

  /* =========================================================
     HELPERS
  ========================================================= */

  function formatDate(date?: string | null) {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return "";
    }
  }

  function buildSelectionText() {
    return selectedItems
      .map((item) => {
        return `${item.title}\n${item.excerpt || ""}`;
      })
      .join("\n\n");
  }

  function copyToClipboard() {
    const text =
      tab === "selection"
        ? buildSelectionText()
        : analysis;

    navigator.clipboard.writeText(text || "");
  }

  /* =========================================================
     RENDER ANALYSIS (réutilisé)
  ========================================================= */

  function renderOutput(text: string) {
    const lines = text.split("\n");

    return lines.map((line, i) => {
      const trimmed = line.trim();

      if (
        trimmed.startsWith("📊") ||
        trimmed.startsWith("📰") ||
        trimmed.startsWith("📈") ||
        trimmed.startsWith("🧠")
      ) {
        return (
          <div key={i} className="mt-6 mb-2 text-sm font-semibold text-gray-900">
            {trimmed}
          </div>
        );
      }

      if (trimmed.startsWith("•")) {
        return (
          <div key={i} className="pl-3 mb-2 text-sm text-gray-800 leading-relaxed">
            {trimmed}
          </div>
        );
      }

      if (trimmed.startsWith("[")) {
        const tags = trimmed
          .replace("[", "")
          .replace("]", "")
          .split(",");

        return (
          <div key={i} className="flex flex-wrap gap-1 mb-2">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {t.trim()}
              </span>
            ))}
          </div>
        );
      }

      if (trimmed.length > 0) {
        return (
          <div key={i} className="text-sm text-gray-700 mb-3 leading-relaxed">
            {trimmed}
          </div>
        );
      }

      return null;
    });
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="h-full flex flex-col bg-white border rounded-xl overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            Sélection
          </div>
          <div className="text-xs text-gray-400">
            {selectedItems.length} élément(s)
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* TABS */}
      <div className="flex border-b">
        <button
          onClick={() => setTab("selection")}
          className={`flex-1 py-2 text-xs font-medium ${
            tab === "selection"
              ? "border-b-2 border-black text-black"
              : "text-gray-400"
          }`}
        >
          Sélection
        </button>

        <button
          onClick={() => setTab("analysis")}
          className={`flex-1 py-2 text-xs font-medium ${
            tab === "analysis"
              ? "border-b-2 border-black text-black"
              : "text-gray-400"
          }`}
        >
          Analyse
        </button>
      </div>

      {/* ACTION */}
      <div className="p-3 border-b flex gap-2">
        <button
          onClick={onGenerateInsight}
          disabled={loading || selectedItems.length === 0}
          className="flex-1 py-2 text-xs rounded-lg bg-black text-white disabled:opacity-50"
        >
          Générer analyse
        </button>

        <button
          onClick={copyToClipboard}
          disabled={selectedItems.length === 0}
          className="px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700"
        >
          Copier
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto p-4">

        {/* EMPTY */}
        {selectedItems.length === 0 && (
          <div className="text-xs text-gray-400">
            Sélectionne des contenus pour construire ton email
          </div>
        )}

        {/* TAB: SELECTION */}
        {tab === "selection" && (
          <div className="space-y-6">
            {selectedItems.map((item) => (
              <div key={item.id} className="space-y-2">

                <div className="text-xs text-gray-400">
                  {formatDate(item.published_at)}
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {item.title}
                </div>

                {item.excerpt && (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {item.excerpt}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* TAB: ANALYSIS */}
        {tab === "analysis" && (
          <>
            {loading && (
              <div className="text-xs text-gray-400">
                Génération en cours...
              </div>
            )}

            {!loading && !analysis && (
              <div className="text-xs text-gray-400">
                Clique sur "Générer analyse"
              </div>
            )}

            {!loading && analysis && renderOutput(analysis)}
          </>
        )}

      </div>
    </div>
  );
}
