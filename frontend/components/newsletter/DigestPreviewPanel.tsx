"use client";

import NewsletterPreview from "./NewsletterPreview";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers?: NewsletterNumberItem[];
  topicStats?: TopicStat[];
};

export default function DigestPreviewPanel({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers = [],
  topicStats = [],
}: Props) {

  const totalItems =
    news.length +
    breves.length +
    analyses.length +
    numbers.length;

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* HEADER SIMPLE */}
      <div className="px-5 py-4 border-b bg-white flex justify-between items-center">
        <h2 className="text-sm font-semibold tracking-tight">
          Preview newsletter
        </h2>

        <div className="text-xs text-gray-400">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-3 py-4">

        {totalItems === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Aucun élément sélectionné
          </div>
        ) : (
          <NewsletterPreview
            headerConfig={headerConfig}
            introText={introText}
            news={news}
            breves={breves}
            analyses={analyses}
            numbers={numbers} // 🔥 important
            topicStats={topicStats}
          />
        )}

      </div>
    </div>
  );
}
