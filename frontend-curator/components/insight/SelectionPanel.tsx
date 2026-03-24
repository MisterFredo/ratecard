"use client";

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
     PARSE OUTPUT (ULTRA SIMPLE)
  ========================================================= */

  function renderOutput(text: string) {
    const lines = text.split("\n");

    return lines.map((line, i) => {
      const trimmed = line.trim();

      // TITRES
      if (trimmed.startsWith("📊") || trimmed.startsWith("📰") || trimmed.startsWith("📈") || trimmed.startsWith("🧠")) {
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

      // BADGES (ligne entre [])
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

      // TEXTE NORMAL
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
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-900">
          Sélection
        </div>
        <div className="text-xs text-gray-400">
          {selectedItems.length} élément(s)
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-2 max-h-[200px] overflow-auto pr-1 mb-4">
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
      <div className="flex gap-2 mb-4">
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

      {/* OUTPUT */}
      <div className="flex-1 border rounded-xl bg-white flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-medium text-gray-700">
            Sortie
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
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="text-xs text-gray-400">
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

    </div>
  );
}
