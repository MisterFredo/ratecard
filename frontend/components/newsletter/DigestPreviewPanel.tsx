"use client";

import { useMemo } from "react";
import NewsletterPreview from "./NewsletterPreview";

import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

type TopicStat = {
  label: string;
  count: number;
};

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  topicStats?: TopicStat[];
};

export default function DigestPreviewPanel({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  topicStats = [],
}: Props) {

  const totalItems = useMemo(
    () => news.length + breves.length + analyses.length,
    [news, breves, analyses]
  );

  const isEmpty = totalItems === 0;

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="text-sm font-semibold">
          Preview newsletter
        </h2>

        <div className="text-xs text-gray-400">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          BODY
      ========================== */}
      <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-4">

        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-center text-gray-400 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-gray-500">
                Aucune sélection
              </div>
              <div>
                Sélectionnez des contenus à gauche.
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[640px] bg-white shadow-sm border border-gray-200">

            <NewsletterPreview
              headerConfig={headerConfig}
              introText={introText}
              news={news}
              breves={breves}
              analyses={analyses}
              topicStats={topicStats}
            />

          </div>
        )}

      </div>
    </div>
  );
}
