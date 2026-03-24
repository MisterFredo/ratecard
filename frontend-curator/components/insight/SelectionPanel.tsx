"use client";

import type { FeedItem } from "@/types/feed";

type Props = {
  html?: string;          // preview auto
  insightHtml?: string;   // insight injecté

  loading: boolean;

  onGenerateInsight: () => void;
};

export default function SelectionPanel({
  html,
  insightHtml,
  loading,
  onGenerateInsight,
}: Props) {

  return (
    <div className="h-full flex flex-col gap-4">

      {/* =====================================================
         ACTION BAR (MINIMAL)
      ===================================================== */}
      <div className="flex justify-end">
        <button
          onClick={onGenerateInsight}
          className="px-3 py-1.5 rounded bg-black text-white text-xs"
        >
          Insight
        </button>
      </div>

      {/* =====================================================
         OUTPUT UNIQUE (FULL EDITORIAL)
      ===================================================== */}
      <div className="flex-1 border rounded-xl bg-white overflow-hidden flex flex-col">

        <div className="flex-1 overflow-auto">

          {loading && (
            <div className="p-6 text-sm text-gray-400">
              Génération en cours...
            </div>
          )}

          {/* INSIGHT (TOP PRIORITY) */}
          {!loading && insightHtml && (
            <div className="p-6 border-b bg-gray-50">
              <div
                className="max-w-[680px] mx-auto text-sm"
                dangerouslySetInnerHTML={{ __html: insightHtml }}
              />
            </div>
          )}

          {/* PREVIEW (BASE) */}
          {!loading && html && (
            <div className="p-6">
              <div
                className="max-w-[680px] mx-auto text-sm"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}

          {!loading && !html && (
            <div className="p-6 text-sm text-gray-400">
              Sélectionne des contenus pour voir le rendu.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
