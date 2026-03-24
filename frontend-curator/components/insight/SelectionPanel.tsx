"use client";

import {
  Mail,
  Brain,
  Loader2,
  Copy,
} from "lucide-react";

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

  function formatDate(date?: string | null) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  /* ========================================================= */

  return (
    <div className="sticky top-6 h-[calc(100vh-48px)] overflow-auto pr-2 space-y-6">

      {/* HEADER */}
      <div>
        <div className="text-sm font-semibold text-gray-900">
          Sélection
        </div>
        <div className="text-xs text-gray-400">
          {selectedItems.length} élément(s)
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[260px] overflow-auto">
        {selectedItems.length === 0 && (
          <div className="text-xs text-gray-400">
            Aucune sélection
          </div>
        )}

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
          className="flex-1 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Générer
        </button>

        <button
          onClick={onGenerateInsight}
          disabled={loading || selectedItems.length === 0}
          className="flex-1 py-2 text-xs rounded-lg bg-black text-white disabled:opacity-50"
        >
          Insight
        </button>
      </div>

      {/* LOADER */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="animate-spin" size={14} />
          Génération en cours...
        </div>
      )}

      {/* OUTPUT */}
      {finalEmail && !loading && (
        <div className="border rounded-lg p-4 bg-white space-y-4">

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

          {/* CONTENT */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {finalEmail}
          </div>
        </div>
      )}
    </div>
  );
}
