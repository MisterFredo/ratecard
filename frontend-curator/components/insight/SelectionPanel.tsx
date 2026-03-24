"use client";

import {
  Mail,
  Brain,
  Copy,
  Sparkles,
} from "lucide-react";

import type { FeedItem } from "@/types/feed";

/* ========================================================= */

type Props = {
  items: FeedItem[];
  selectedIds: string[];

  finalEmail: string;
  insight?: string;

  loading: boolean;

  onGeneratePreview: () => void;
  onGenerateInsight: () => void;
};

/* ========================================================= */

export default function SelectionPanel({
  items,
  selectedIds,
  finalEmail,
  insight,
  loading,
  onGeneratePreview,
  onGenerateInsight,
}: Props) {

  const selectedItems = items.filter((i) =>
    selectedIds.includes(i.id)
  );

  function formatDate(date?: string | null) {
    if (!date) return "";
    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return "";
    }
  }

  /* =========================================================
     PARSE LLM
  ========================================================= */

  function parseInsight(text?: string) {
    if (!text) return [];

    const sections = text.split("\n\n");

    return sections.map((s, i) => (
      <div key={i} className="space-y-2">
        {s.split("\n").map((line, j) => {
          if (line.startsWith("-")) {
            return (
              <div key={j} className="flex gap-2 text-sm">
                <span className="text-gray-400">•</span>
                <span className="text-gray-700">
                  {line.replace("- ", "")}
                </span>
              </div>
            );
          }

          return (
            <div
              key={j}
              className="text-xs font-semibold text-gray-500 uppercase"
            >
              {line}
            </div>
          );
        })}
      </div>
    ));
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="sticky top-4 space-y-6 h-[calc(100vh-40px)] overflow-auto pr-2">

      {/* HEADER */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-gray-900">
          Sélection
        </div>
        <div className="text-xs text-gray-400">
          {selectedItems.length} élément(s)
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[260px] overflow-auto">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-2 bg-white text-xs space-y-1"
          >
            <div className="text-[10px] text-gray-400">
              {formatDate(item.published_at)}
            </div>

            <div className="font-medium text-gray-800 line-clamp-2">
              {item.title}
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-1">
              {item.companies?.map((c: any) => (
                <span
                  key={c.id_company}
                  className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded"
                >
                  {c.name}
                </span>
              ))}

              {item.topics?.map((t: any) => (
                <span
                  key={t.id_topic}
                  className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2">
        <button
          onClick={onGeneratePreview}
          disabled={loading || selectedItems.length === 0}
          className="flex items-center justify-center gap-2 flex-1 py-2 text-xs rounded-lg bg-gray-100 text-gray-700"
        >
          <Mail size={14} />
          Générer
        </button>

        <button
          onClick={onGenerateInsight}
          disabled={loading || selectedItems.length === 0}
          className="flex items-center justify-center gap-2 flex-1 py-2 text-xs rounded-lg bg-black text-white"
        >
          <Sparkles size={14} />
          Insight
        </button>
      </div>

      {/* OUTPUT */}
      {finalEmail && (
        <div className="space-y-4 border rounded-lg p-4 bg-white">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Mail size={16} />
              Veille
            </div>

            <button
              onClick={() =>
                navigator.clipboard.writeText(finalEmail)
              }
              className="flex items-center gap-1 text-xs text-blue-600"
            >
              <Copy size={14} />
              Copier
            </button>
          </div>

          {/* EMAIL */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {finalEmail}
          </div>
        </div>
      )}

      {/* INSIGHT */}
      {insight && (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Brain size={16} />
            Insight
          </div>

          <div className="space-y-4">
            {parseInsight(insight)}
          </div>
        </div>
      )}
    </div>
  );
}
