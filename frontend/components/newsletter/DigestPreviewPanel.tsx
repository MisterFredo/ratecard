"use client";

import { useMemo, useState } from "react";
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

  const [mode, setMode] = useState<"brevo" | "gmail">("brevo");

  const totalItems = useMemo(
    () => news.length + breves.length + analyses.length + numbers.length,
    [news, breves, analyses, numbers]
  );

  const isEmpty = totalItems === 0;

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white">

        <h2 className="text-sm font-semibold tracking-tight">
          Preview newsletter
        </h2>

        <div className="flex items-center gap-2">

          <button
            onClick={() => setMode("brevo")}
            className={`px-3 py-1 text-xs border rounded ${
              mode === "brevo" ? "bg-black text-white" : ""
            }`}
          >
            Brevo
          </button>

          <button
            onClick={() => setMode("gmail")}
            className={`px-3 py-1 text-xs border rounded ${
              mode === "gmail" ? "bg-black text-white" : ""
            }`}
          >
            Gmail
          </button>

          <button className="px-3 py-1 text-xs border rounded">
            Copier HTML
          </button>

        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto bg-white px-3 py-4">

        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-center text-gray-400 text-sm">
            Aucun élément sélectionné
          </div>
        ) : (
          <div className="w-full">

            <NewsletterPreview
              mode={mode} // 🔥 IMPORTANT
              headerConfig={headerConfig}
              introText={introText}
              news={news}
              breves={breves}
              analyses={analyses}
              numbers={numbers}
              topicStats={topicStats}
            />

          </div>
        )}

      </div>
    </div>
  );
}
