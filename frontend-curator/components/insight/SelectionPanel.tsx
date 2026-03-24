"use client";

import { useMemo, useRef, useState } from "react";

import { buildEmail } from "@/components/newsletter/email/buildEmail";
import { buildEmailGmail } from "@/components/newsletter/email/buildEmailGmail";

import type { FeedItem } from "@/types/feed";

type Props = {
  items: FeedItem[];

  loading: boolean;

  onGenerateInsight: () => void;
};

export default function SelectionPanel({
  items,
  loading,
  onGenerateInsight,
}: Props) {

  const [mode, setMode] = useState<"brevo" | "gmail">("brevo");

  const hiddenRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     MAP DATA → NEWSLETTER FORMAT
  ===================================================== */

  const news = useMemo(() => {
    return items
      .filter((i) => i.type === "news")
      .map((i) => ({
        title: i.title,
        excerpt: i.excerpt,
        published_at: i.published_at,
        companies: i.companies,
        topics: i.topics,
      }));
  }, [items]);

  const analyses = useMemo(() => {
    return items
      .filter((i) => i.type === "analysis")
      .map((i) => ({
        title: i.title,
        excerpt: i.excerpt,
        published_at: i.published_at,
        companies: i.companies,
        topics: i.topics,
      }));
  }, [items]);

  /* =====================================================
     BUILD HTML (IDENTIQUE ADMIN)
  ===================================================== */

  const html = useMemo(() => {
    if (mode === "gmail") {
      return buildEmailGmail({
        headerConfig: {
          title: "Veille personnalisée",
        },
        news,
        breves: [],
        analyses,
      });
    }

    return buildEmail({
      headerConfig: {
        title: "Veille personnalisée",
      },
      news,
      breves: [],
      analyses,
    });
  }, [mode, news, analyses]);

  /* =====================================================
     COPY
  ===================================================== */

  function copyHtml() {
    navigator.clipboard.writeText(html);
  }

  function copyForGmail() {
    if (!hiddenRef.current) return;

    const container = hiddenRef.current;
    container.innerHTML = html;

    const range = document.createRange();
    range.selectNodeContents(container);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    document.execCommand("copy");

    selection?.removeAllRanges();
    container.innerHTML = "";
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="space-y-4 h-full flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Preview ({items.length})
        </h2>

        <div className="flex items-center gap-3">

          {/* MODE */}
          <div className="flex border rounded overflow-hidden text-xs">
            <button
              onClick={() => setMode("brevo")}
              className={`px-3 py-1.5 ${
                mode === "brevo"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              Brevo
            </button>

            <button
              onClick={() => setMode("gmail")}
              className={`px-3 py-1.5 border-l ${
                mode === "gmail"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              Gmail
            </button>
          </div>

          {/* ACTIONS */}
          <button
            onClick={copyHtml}
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
          >
            Copier HTML
          </button>

          {mode === "gmail" && (
            <button
              onClick={copyForGmail}
              className="px-3 py-1.5 rounded bg-white border text-xs"
            >
              Copier Gmail
            </button>
          )}

          <button
            onClick={onGenerateInsight}
            className="px-3 py-1.5 rounded bg-black text-white text-xs"
          >
            Insight
          </button>

        </div>
      </div>

      {/* IFRAME */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <iframe
          title="Preview"
          srcDoc={html}
          className="w-full h-full"
        />
      </div>

      {/* hidden gmail copy */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      />
    </section>
  );
}
