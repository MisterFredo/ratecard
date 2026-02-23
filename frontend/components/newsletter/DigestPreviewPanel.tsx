"use client";

import { useState } from "react";
import NewsletterPreview from "./NewsletterPreview";
import ClientNewsletterPreview from "./ClientNewsletterPreview";

import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
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
}: Props) {
  const [mode, setMode] = useState<"html" | "client">("html");

  return (
    <div className="h-full flex flex-col border rounded bg-white overflow-hidden">

      {/* =========================
          HEADER / TABS
      ========================== */}
      <div className="flex items-center justify-between border-b px-4 py-3">

        <div className="flex gap-2">

          <button
            onClick={() => setMode("html")}
            className={`px-3 py-1.5 text-xs rounded ${
              mode === "html"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            HTML (Brevo)
          </button>

          <button
            onClick={() => setMode("client")}
            className={`px-3 py-1.5 text-xs rounded ${
              mode === "client"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Version client
          </button>

        </div>

        <div className="text-xs text-gray-400">
          {news.length + breves.length + analyses.length} éléments
        </div>

      </div>

      {/* =========================
          PREVIEW CONTENT
      ========================== */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">

        {mode === "html" ? (
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
