"use client";

import { useMemo, useState } from "react";
import NewsletterPreview from "./NewsletterPreview";
import ClientNewsletterPreview from "./ClientNewsletterPreview";

import type {
  NewsletterNewsItem,
  HeaderConfig"use client";

import { useMemo, useState } from "react";
import NewsletterPreview from "./NewsletterPreview";
import ClientNewsletterPreview from "./ClientNewsletterPreview";

import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

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

  return (
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* =========================
          HEADER
      ========================== */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">

        <div className="flex bg-gray-100 rounded p-1">
          <button
            onClick={() => setMode("html")}
            className={`
              px-3 py-1 text-xs rounded transition
              ${
                mode === "html"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            HTML
          </button>

          <button
            onClick={() => setMode("client")}
            className={`
              px-3 py-1 text-xs rounded transition
              ${
                mode === "client"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Client
          </button>
        </div>

        <div className="text-xs text-gray-400">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* =========================
          BODY
      ========================== */}
      <div className="flex-1 overflow-y-auto bg-gray-100 px-4 py-4">

        <div className="mx-auto max-w-[640px] bg-white shadow-sm border border-gray-200">

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

        {totalItems === 0 && (
          <div className="text-center text-xs text-gray-400 mt-4">
            Aucun contenu éditorial sélectionné
          </div>
        )}

      </div>
    </div>
  );
}
  NewsletterAnalysisItem,
} from "@/types/newsletter";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

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
    <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">

        <div className="flex bg-gray-100 rounded p-1">
          <button
            onClick={() => setMode("html")}
            className={`
              px-3 py-1 text-xs rounded transition
              ${
                mode === "html"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            HTML
          </button>

          <button
            onClick={() => setMode("client")}
            className={`
              px-3 py-1 text-xs rounded transition
              ${
                mode === "client"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            Client
          </button>
        </div>

        <div className="text-xs text-gray-400">
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </div>
      </div>

      {/* BODY */}
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
        )}

      </div>
    </div>
  );
}
