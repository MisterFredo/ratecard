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

  function updateTypeSelection(
    ids: string[],
    type: EditorialItem["type"]
  ) {
    setEditorialOrder((prev) => {
      // on garde les autres types
      const others = prev.filter((item) => item.type !== type);

      // on reconstruit le type concerné
      const updated = ids.map((id) => ({ id, type }));

      return [...others, ...updated];
    });
  }

  return (
    <div className="grid grid-cols-3 gap-10">

      <NewsletterSelector
        title="News"
        items={news}
        selectedIds={editorialOrder
          .filter((i) => i.type === "news")
          .map((i) => i.id)}
        onChange={(ids) => updateTypeSelection(ids, "news")}
      />

      <NewsletterSelector
        title="Brèves"
        items={breves}
        selectedIds={editorialOrder
          .filter((i) => i.type === "breve")
          .map((i) => i.id)}
        onChange={(ids) => updateTypeSelection(ids, "breve")}
      />

      <NewsletterSelector
        title="Analyses"
        items={analyses}
        selectedIds={editorialOrder
          .filter((i) => i.type === "analysis")
          .map((i) => i.id)}
        onChange={(ids) => updateTypeSelection(ids, "analysis")}
      />

    </div>
  );
}
