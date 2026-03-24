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

  /* =========================================================
     SELECT + COPY (FIX)
  ========================================================= */

  function selectAndCopy() {
    const el = document.getElementById("selection-content");
    if (!el) return;

    const range = document.createRange();
    range.selectNodeContents(el);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // 🔥 copie auto
    try {
      navigator.clipboard.writeText(el.innerText);
    } catch (e) {
      console.warn("copy failed");
    }
  }

  /* =========================================================
     CLEAN ANALYSIS (REMOVE RAW CONTENT)
  ========================================================= */

  function cleanAnalysis(text: string) {
    if (!text) return "";

    const lines = text.split("\n");

    // 🔥 on coupe dès qu'on détecte du contenu brut (fallback simple mais efficace)
    const startIndex = lines.findIndex((l) =>
      l.toUpperCase().includes("POINT") ||
      l.toUpperCase().includes("ANALYSE")
    );

    if (startIndex === -1) return text;

    return lines.slice(startIndex).join("\n");
  }

  /* =========================================================
     RENDER ANALYSIS (PREMIUM)
  ========================================================= */

  function renderAnalysis(text: string) {
    const cleaned = cleanAnalysis(text);
    const sections = cleaned.split("\n\n");

    return sections.map((block, i) => {
      const lines = block.split("\n").map((l) => l.trim());

      // TITLE
      if (
        lines[0]?.toUpperCase().includes("POINT") ||
        lines[0]?.toUpperCase().includes("ANALYSE")
      ) {
        return (
          <div key={i} className="mb-5">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">
              {lines[0]}
            </div>
          </div>
        );
      }

      // BULLETS
      if (lines.every((l) => l.startsWith("-") || l.startsWith("•"))) {
        return (
          <div key={i} className="space-y-2 mb-6">
            {lines.map((l, idx) => (
              <div key={idx} className="flex gap-2 text-sm text-gray-800">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black" />
                <span>{l.replace(/^[-•]\s*/, "")}</span>
              </div>
            ))}
          </div>
        );
      }

      // PARAGRAPH
      return (
        <div key={i} className="text-sm text-gray-700 leading-relaxed mb-4">
          {block}
        </div>
      );
    });
  }

  /* =========================================================
     HANDLE ANALYSIS CLICK (UX FIX)
  ========================================================= */

  function handleGenerate() {
    setTab("analysis"); // 🔥 switch immédiat
    onGenerateInsight();
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

      {/* ACTIONS */}
      <div className="p-3 border-b flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading || selectedItems.length === 0}
          className="flex-1 py-2 text-xs rounded-lg bg-black text-white disabled:opacity-50"
        >
          Générer analyse
        </button>

        <button
          onClick={selectAndCopy}
          disabled={selectedItems.length === 0}
          className="px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700"
        >
          Sélectionner
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

        {/* =========================
            SELECTION
        ========================= */}
        {tab === "selection" && (
          <div id="selection-content" className="space-y-8">

            {selectedItems.map((item, index) => (
              <div key={item.id} className="space-y-3">

                <div className="text-xs text-gray-400">
                  {formatDate(item.published_at)}
                </div>

                <div className="text-sm font-semibold text-gray-900">
                  {item.title}
                </div>

                {/* BADGES */}
                <div className="flex flex-wrap gap-1">
                  {item.companies?.map((c: any) => (
                    <span
                      key={c.id_company}
                      className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded"
                    >
                      {c.name}
                    </span>
                  ))}

                  {item.solutions?.map((s: any) => (
                    <span
                      key={s.id_solution}
                      className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded"
                    >
                      {s.name}
                    </span>
                  ))}

                  {item.topics?.map((t: any) => (
                    <span
                      key={t.id_topic}
                      className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                    >
                      {t.label}
                    </span>
                  ))}
                </div>

                {item.excerpt && (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {item.excerpt}
                  </div>
                )}

                {index !== selectedItems.length - 1 && (
                  <div className="border-t pt-4" />
                )}

              </div>
            ))}

          </div>
        )}

        {/* =========================
            ANALYSIS
        ========================= */}
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

            {!loading && analysis && renderAnalysis(analysis)}
          </>
        )}

      </div>
    </div>
  );
}
