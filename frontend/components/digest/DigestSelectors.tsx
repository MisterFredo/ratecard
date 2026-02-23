"use client";

import NewsletterSelector from "@/components/newsletter/NewsletterSelector";
import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

type Props = {
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];

  editorialOrder: EditorialItem[];
  setEditorialOrder: React.Dispatch<
    React.SetStateAction<EditorialItem[]>
  >;
};

export default function DigestSelectors({
  news,
  breves,
  analyses,
  editorialOrder,
  setEditorialOrder,
}: Props) {

  function toggleEditorialItem(
    id: string,
    type: EditorialItem["type"]
  ) {
    const exists = editorialOrder.find(
      (item) => item.id === id && item.type === type
    );

    if (exists) {
      setEditorialOrder((prev) =>
        prev.filter(
          (item) => !(item.id === id && item.type === type)
        )
      );
    } else {
      setEditorialOrder((prev) => [
        ...prev,
        { id, type },
      ]);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-10">
      <NewsletterSelector
        title="News"
        items={news}
        selectedIds={editorialOrder
          .filter((i) => i.type === "news")
          .map((i) => i.id)}
        onChange={(ids) =>
          ids.forEach((id) =>
            toggleEditorialItem(id, "news")
          )
        }
      />

      <NewsletterSelector
        title="Brèves"
        items={breves}
        selectedIds={editorialOrder
          .filter((i) => i.type === "breve")
          .map((i) => i.id)}
        onChange={(ids) =>
          ids.forEach((id) =>
            toggleEditorialItem(id, "breve")
          )
        }
      />

      <NewsletterSelector
        title="Analyses"
        items={analyses}
        selectedIds={editorialOrder
          .filter((i) => i.type === "analysis")
          .map((i) => i.id)}
        onChange={(ids) =>
          ids.forEach((id) =>
            toggleEditorialItem(id, "analysis")
          )
        }
      />
    </div>
  );
}
