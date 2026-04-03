"use client";

import { useMemo } from "react";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
} from "@/types/newsletter";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis" | "number";
};

type Props = {
  editorialOrder: EditorialItem[];
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers: NewsletterNumberItem[];
  setEditorialOrder: React.Dispatch<
    React.SetStateAction<EditorialItem[]>
  >;
};

export default function DigestEditorialFlow({
  editorialOrder,
  news,
  breves,
  analyses,
  numbers,
  setEditorialOrder,
}: Props) {

  /* =========================================
     INDEX MAPS (PERF)
  ========================================= */

  const newsMap = useMemo(
    () => Object.fromEntries(news.map(n => [n.id, n])),
    [news]
  );

  const brevesMap = useMemo(
    () => Object.fromEntries(breves.map(b => [b.id, b])),
    [breves]
  );

  const analysesMap = useMemo(
    () => Object.fromEntries(analyses.map(a => [a.id, a])),
    [analyses]
  );

  const numbersMap = useMemo(
    () => Object.fromEntries(numbers.map(n => [n.id, n])),
    [numbers]
  );

  /* =========================================
     UTILS
  ========================================= */

  function formatValue(n: NewsletterNumberItem) {
    if (n.value === undefined || n.value === null) return "";

    const scaleMap: any = {
      thousand: "K",
      million: "M",
      millions: "M",
      billion: "Md",
      billions: "Md",
    };

    const scale = scaleMap[n.scale || ""] || "";
    const unit = n.unit || "";

    return [n.value, scale, unit]
      .filter(Boolean)
      .join(" ");
  }

  function resolveSource(item: EditorialItem) {
    switch (item.type) {
      case "news":
        return newsMap[item.id];
      case "breve":
        return brevesMap[item.id];
      case "analysis":
        return analysesMap[item.id];
      case "number":
        return numbersMap[item.id];
      default:
        return null;
    }
  }

  function getLabel(type: EditorialItem["type"]) {
    switch (type) {
      case "news":
        return "news";
      case "breve":
        return "brève";
      case "analysis":
        return "analyse";
      case "number":
        return "chiffre";
      default:
        return type;
    }
  }

  function getTitle(item: EditorialItem, source: any) {
    if (!source) return "";

    if (item.type === "number") {
      return `${source.label} — ${formatValue(source)}`;
    }

    return source.title || "";
  }

  /* =========================================
     ACTIONS
  ========================================= */

  function moveUp(index: number) {
    if (index === 0) return;

    setEditorialOrder((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [
        updated[index],
        updated[index - 1],
      ];
      return updated;
    });
  }

  function moveDown(index: number) {
    if (index === editorialOrder.length - 1) return;

    setEditorialOrder((prev) => {
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [
        updated[index],
        updated[index + 1],
      ];
      return updated;
    });
  }

  function removeItem(index: number) {
    setEditorialOrder((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (editorialOrder.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">
          Flux éditorial
        </h2>
        <div className="border border-gray-200 rounded-lg bg-white px-4 py-4 text-xs text-gray-400 text-center">
          Aucun élément sélectionné
        </div>
      </section>
    );
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">
        Flux éditorial
      </h2>

      <div className="border border-gray-200 rounded-lg bg-white divide-y">

        {editorialOrder.map((item, index) => {
          const source = resolveSource(item);
          if (!source) return null;

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <div className="flex items-start gap-2 min-w-0">

                <span className="text-[10px] uppercase tracking-wide text-gray-400 shrink-0">
                  {getLabel(item.type)}
                </span>

                <span className="text-gray-900 font-medium truncate">
                  {getTitle(item, source)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">

                <button onClick={() => moveUp(index)} className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50">
                  ↑
                </button>

                <button onClick={() => moveDown(index)} className="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-50">
                  ↓
                </button>

                <button onClick={() => removeItem(index)} className="px-1.5 py-0.5 border border-gray-200 rounded text-red-600 hover:bg-red-50">
                  ✕
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
