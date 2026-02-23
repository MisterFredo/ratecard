"use client";

import NewsletterSelector from "@/components/newsletter/NewsletterSelector";

type EditorialItem = {
  id: string;
  type: "news" | "breve" | "analysis";
};

type Props = {
  news: any[];
  breves: any[];
  analyses: any[];
  editorialOrder: EditorialItem[];
  toggleEditorialItem: (
    id: string,
    type: EditorialItem["type"]
  ) => void;
};

export default function DigestSelectors({
  news,
  breves,
  analyses,
  editorialOrder,
  toggleEditorialItem,
}: Props) {
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
