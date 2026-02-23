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
      const others = prev.filter((item) => item.type !== type);
      const updated = ids.map((id) => ({ id, type }));
      return [...others, ...updated];
    });
  }

  const newsSelected = editorialOrder.filter(i => i.type === "news").length;
  const brevesSelected = editorialOrder.filter(i => i.type === "breve").length;
  const analysesSelected = editorialOrder.filter(i => i.type === "analysis").length;

  return (
    <div className="space-y-12">

      {/* =========================
          NEWS
      ========================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            News
          </h2>
          <span className="text-xs text-gray-400">
            {newsSelected} sélectionnée{newsSelected > 1 ? "s" : ""}
          </span>
        </div>

        <NewsletterSelector
          title=""
          items={news}
          selectedIds={editorialOrder
            .filter((i) => i.type === "news")
            .map((i) => i.id)}
          onChange={(ids) => updateTypeSelection(ids, "news")}
        />
      </section>

      {/* =========================
          BRÈVES
      ========================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            Brèves
          </h2>
          <span className="text-xs text-gray-400">
            {brevesSelected} sélectionnée{brevesSelected > 1 ? "s" : ""}
          </span>
        </div>

        <NewsletterSelector
          title=""
          items={breves}
          selectedIds={editorialOrder
            .filter((i) => i.type === "breve")
            .map((i) => i.id)}
          onChange={(ids) => updateTypeSelection(ids, "breve")}
        />
      </section>

      {/* =========================
          ANALYSES
      ========================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            Analyses
          </h2>
          <span className="text-xs text-gray-400">
            {analysesSelected} sélectionnée{analysesSelected > 1 ? "s" : ""}
          </span>
        </div>

        <NewsletterSelector
          title=""
          items={analyses}
          selectedIds={editorialOrder
            .filter((i) => i.type === "analysis")
            .map((i) => i.id)}
          onChange={(ids) => updateTypeSelection(ids, "analysis")}
        />
      </section>

    </div>
  );
}
