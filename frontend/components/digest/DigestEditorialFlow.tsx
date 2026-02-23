"use client";

import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

type Props = {
  editorialOrder: EditorialItem[];
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  setEditorialOrder: React.Dispatch<
    React.SetStateAction<EditorialItem[]>
  >;
};

export default function DigestEditorialFlow({
  editorialOrder,
  news,
  breves,
  analyses,
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

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold">
        Flux éditorial
      </h2>

      <div className="border rounded-lg bg-white divide-y">
        {editorialOrder.map((item, index) => {
          const source =
            item.type === "news"
              ? news.find((n) => n.id === item.id)
              : item.type === "breve"
              ? breves.find((b) => b.id === item.id)
              : analyses.find((a) => a.id === item.id);

          if (!source) return null;

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3"
            >
              <div className="text-sm">
                <span className="text-gray-400 uppercase text-xs mr-2">
                  {item.type}
                </span>
                {source.title}
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => moveUp(index)}
                  className="px-2 py-1 border rounded"
                >
                  ↑
                </button>

                <button
                  onClick={() => moveDown(index)}
                  className="px-2 py-1 border rounded"
                >
                  ↓
                </button>

                <button
                  onClick={() => removeItem(index)}
                  className="px-2 py-1 border rounded text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {editorialOrder.length === 0 && (
          <div className="p-4 text-sm text-gray-400 text-center">
            Aucun élément sélectionné
          </div>
        )}
      </div>
    </section>
  );
}
