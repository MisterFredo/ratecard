"use client";

import { useState } from "react";
import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[];
  selectedIds: string[];

  finalEmail: string;

  loading: boolean;

  onGeneratePreview: () => void;
  onGenerateInsight: () => void;
};

/* ========================================================= */

export default function SelectionPanel({
  items,
  selectedIds,
  finalEmail,
  loading,
  onGeneratePreview,
  onGenerateInsight,
}: Props) {

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id)
  );

  /* =========================================================
     MODE (comme newsletter preview)
  ========================================================= */

  const [mode, setMode] = useState<"preview" | "insight">("preview");

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

  function copyToClipboard() {
    navigator.clipboard.writeText(finalEmail);
  }

  /* =========================================================
     PARSE OUTPUT (amélioré mais simple)
  ========================================================= */

  function renderOutput(text: string) {
    const lines = text.split("\n");

    return lines.map((line, i) => {
      const trimmed = line.trim();

      // TITRES
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

      // BULLET
      if (trimmed.startsWith("•")) {
        return (
          <div key={i} className="pl-3 mb-2 text-sm text-gray-800 leading-relaxed">
            {trimmed}
          </div>
        );
      }

      // BADGES
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

      // TEXTE
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
     ACTION
  ========================================================= */

  function handleGenerate() {
    if (mode === "preview") {
      onGeneratePreview();
    } else {
      onGenerateInsight();
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="space-y-4">

      {/* ======================================
         HEADER (comme NewsletterPreview)
      ====================================== */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-sm font-semibold">
            Sélection ({selectedItems.length})
          </h2>
          <div className="text-xs text-gray-400">
            Contenus sélectionnés
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* MODE SWITCH */}
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
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs disabled:opacity-50"
          >
            Générer
          </button>
        </div>
      </div>

      {/* ======================================
         LISTE (compacte, secondaire)
      ====================================== */}
      <div className="flex flex-col gap-2 max-h-[180px] overflow-auto pr-1">
        {selectedItems.length === 0 && (
          <div className="text-xs text-gray-400">
            Aucune sélection
          </div>
        )}

        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-2 bg-white text-xs"
          >
            <div className="text-[10px] text-gray-400">
              {formatDate(item.published_at)}
            </div>

            <div className="font-medium text-gray-800 line-clamp-2">
              {item.title}
            </div>
          </div>
        ))}
      </div>

      {/* ======================================
         OUTPUT (comme preview)
      ====================================== */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">

        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-medium text-gray-700">
            Résultat
          </span>

          {finalEmail && (
            <button
              onClick={copyToClipboard}
              className="text-xs text-blue-600"
            >
              Copier
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4 max-h-[520px] overflow-auto">

          {loading && (
            <div className="text-xs text-gray-500 animate-pulse">
              Génération en cours...
            </div>
          )}

          {!loading && !finalEmail && (
            <div className="text-xs text-gray-400">
              Génère une sélection pour voir le rendu.
            </div>
          )}

          {!loading && finalEmail && renderOutput(finalEmail)}

        </div>
      </div>

    </section>
  );
}
