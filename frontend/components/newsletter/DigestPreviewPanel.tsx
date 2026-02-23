"use client";

import { useMemo, useState } from "react";
import NewsletterPreview from "./NewsletterPreview";
import ClientNewsletterPreview from "./ClientNewsletterPreview";

import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* ========================================================= */

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

/* ========================================================= */

export default function DigestPreviewPanel({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
}: Props) {
  const [mode, setMode] = useState<"html" | "client">("html");

  const totalItems = useMemo(
    () => news.length + breves.length + analyses.length,
    [news, breves, analyses]
  );

  const isEmpty = totalItems === 0;

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode("html")}
            className={`
              px-4 py-1.5 text-xs rounded-md transition
              ${
                mode === "html"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            HTML
          </button>

          <button
            onClick={() => setMode("client")}
            className={`
              px-4 py-1.5 text-xs rounded-md transition
              ${
                mode === "client"
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Client
          </button>
        </div>

        {/* Counter */}
        <div className="text-xs text-gray-400 tracking-wide">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          BODY
      ========================== */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">

        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-center text-gray-400 text-sm">
            <div className="space-y-2">
              <div className="text-base font-medium text-gray-500">
                Aucune sélection
              </div>
              <div>
                Sélectionnez des contenus à gauche pour
                voir la preview en temps réel.
              </div>
            </div>
          </div>
        ) : mode === "html" ? (
          <NewsletterPreview
            headerConfig={headerConfig}
            introText={introText}
            news={news}
            breves={breves}
            analyses={analyses}
          />
        ) : (
          <ClientNewsletterPreview
            headerConfig={headerConfig}
            introText={introText}
            news={news}
            breves={breves}
            analyses={analyses}
          />
        )}

      </div>
    </div>
  );
}
