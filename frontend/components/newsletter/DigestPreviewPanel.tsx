"use client";

import { useMemo } from "react";
import NewsletterPreview from "./NewsletterPreview";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers: NewsletterNumberItem[]; // 👈 NEW
  topicStats?: TopicStat[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DigestPreviewPanel({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers, // 👈 NEW
  topicStats = [],
}: Props) {

  /* =========================================
     META
  ========================================= */

  const totalItems = useMemo(
    () =>
      news.length +
      breves.length +
      analyses.length +
      numbers.length,
    [news, breves, analyses, numbers]
  );

  const isEmpty = totalItems === 0;

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white">
        <h2 className="text-sm font-semibold tracking-tight">
          Preview newsletter
        </h2>

        <div className="text-xs text-gray-400">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          BODY
      ========================== */}
      <div className="flex-1 overflow-y-auto bg-white px-3 py-4">

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
          <div className="mx-auto w-full max-w-[820px]">

            <NewsletterPreview
              headerConfig={headerConfig}
              introText={introText}
              news={news}
              breves={breves}
              analyses={analyses}
              numbers={numbers} // 👈 NEW
              topicStats={topicStats}
            />

          </div>
        )}

      </div>
    </div>
  );
}
