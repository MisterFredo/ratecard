"use client";

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
  numbers: NewsletterNumberItem[]; // 👈 AJOUT
  setEditorialOrder: React.Dispatch<
    React.SetStateAction<EditorialItem[]>
  >;
};

export default function DigestEditorialFlow({
  editorialOrder,
  news,
  breves,
  analyses,
  numbers, // 👈 AJOUT
  setEditorialOrder,
}: Props) {

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

  function resolveSource(item: EditorialItem) {
    if (item.type === "news") {
      return news.find((n) => n.id === item.id);
    }
    if (item.type === "breve") {
      return breves.find((b) => b.id === item.id);
    }
    if (item.type === "analysis") {
      return analyses.find((a) => a.id === item.id);
    }
    if (item.type === "number") {
      return numbers.find((n) => n.id === item.id);
    }
    return null;
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
        return "chiffre"; // 👈 IMPORTANT (UX)
      default:
        return type;
    }
  }

  function getTitle(item: EditorialItem, source: any) {
    if (item.type === "number") {
      return `${source.label} (${source.value ?? ""} ${source.unit ?? ""})`;
    }
    return source.title;
  }

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

                {/* TYPE */}
                <span className="
                  text-[10px]
                  uppercase
                  tracking-wide
                  text-gray-400
                  shrink-0
                ">
                  {getLabel(item.type)}
                </span>

                {/* TITLE */}
                <span className="
                  text-gray-900
                  font-medium
                  truncate
                ">
                  {getTitle(item, source)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-1 text-xs">

                <button
                  onClick={() => moveUp(index)}
                  className="
                    px-1.5 py-0.5
                    border border-gray-200
                    rounded
                    hover:bg-gray-50
                  "
                >
                  ↑
                </button>

                <button
                  onClick={() => moveDown(index)}
                  className="
                    px-1.5 py-0.5
                    border border-gray-200
                    rounded
                    hover:bg-gray-50
                  "
                >
                  ↓
                </button>

                <button
                  onClick={() => removeItem(index)}
                  className="
                    px-1.5 py-0.5
                    border border-gray-200
                    rounded
                    text-red-600
                    hover:bg-red-50
                  "
                >
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
