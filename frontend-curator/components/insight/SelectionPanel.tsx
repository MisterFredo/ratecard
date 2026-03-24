"use client";

import { useMemo, useRef } from "react";
import type { FeedItem } from "@/types/feed";

/* =========================================================
   HTML BUILDER (PREVIEW)
========================================================= */

function buildEmailCurator(items: FeedItem[]) {
  const news = items.filter((i) => i.type === "news");
  const analyses = items.filter((i) => i.type === "analysis");

  function renderBadges(item: FeedItem) {
    const badges: string[] = [];

    item.companies?.forEach((c: any) => {
      if (c?.name) {
        badges.push(`
          <span style="background:#eef2ff;color:#3730a3;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px;">
            ${c.name}
          </span>
        `);
      }
    });

    item.topics?.forEach((t: any) => {
      if (t?.label) {
        badges.push(`
          <span style="background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px;">
            ${t.label}
          </span>
        `);
      }
    });

    return badges.join("");
  }

  let html = `
    <div style="font-family:Arial, sans-serif;max-width:680px;margin:auto;line-height:1.5;">
      <h2 style="font-size:18px;margin-bottom:20px;">
        📊 Veille personnalisée
      </h2>
  `;

  if (news.length > 0) {
    html += `<h3>📰 News</h3>`;

    news.forEach((n) => {
      html += `
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;">${n.title}</div>
          <div style="margin:6px 0;">${renderBadges(n)}</div>
          <div style="color:#555;">${n.excerpt || ""}</div>
        </div>
      `;
    });
  }

  if (analyses.length > 0) {
    html += `<h3 style="margin-top:20px;">📈 Analyses</h3>`;

    analyses.forEach((a) => {
      html += `
        <div style="margin-bottom:16px;">
          <div style="font-weight:600;">${a.title}</div>
          <div style="margin:6px 0;">${renderBadges(a)}</div>
          <div style="color:#555;">${a.excerpt || ""}</div>
        </div>
      `;
    });
  }

  html += `</div>`;

  return html;
}

/* =========================================================
   INSIGHT BUILDER (LLM)
========================================================= */

function buildInsightBlock(insight: string) {
  if (!insight) return "";

  let html = `
    <div style="background:#f9fafb;padding:16px;border-bottom:1px solid #e5e7eb;">
      <div style="max-width:680px;margin:auto;">
        <h3 style="margin-bottom:10px;">🧠 Points clés</h3>
  `;

  insight.split("\n").forEach((line) => {
    const t = line.trim();

    if (!t) return;

    if (t.startsWith("-")) {
      html += `
        <div style="margin-bottom:6px;">
          • ${t.replace("-", "").trim()}
        </div>
      `;
    }
  });

  html += `</div></div>`;

  return html;
}

/* ========================================================= */

type Props = {
  items: FeedItem[];
  insight?: string; // 🔥 IMPORTANT
  loading: boolean;
  onGenerateInsight: () => void;
};

/* ========================================================= */

export default function SelectionPanel({
  items,
  insight,
  loading,
  onGenerateInsight,
}: Props) {

  const hiddenRef = useRef<HTMLDivElement>(null);

  /* =====================================================
     PREVIEW
  ===================================================== */

  const previewHtml = useMemo(() => {
    if (!items.length) return "";
    return buildEmailCurator(items);
  }, [items]);

  /* =====================================================
     FINAL HTML = INSIGHT + PREVIEW
  ===================================================== */

  const finalHtml = useMemo(() => {
    if (!previewHtml) return "";

    const insightBlock = buildInsightBlock(insight || "");

    return insightBlock + previewHtml;
  }, [previewHtml, insight]);

  /* =====================================================
     COPY
  ===================================================== */

  function copyHtml() {
    navigator.clipboard.writeText(finalHtml);
  }

  function copyForGmail() {
    if (!hiddenRef.current) return;

    const container = hiddenRef.current;
    container.innerHTML = finalHtml;

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

        <div className="flex items-center gap-2">

          <button
            onClick={copyHtml}
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
          >
            Copier HTML
          </button>

          <button
            onClick={copyForGmail}
            className="px-3 py-1.5 rounded bg-white border text-xs"
          >
            Copier Gmail
          </button>

          <button
            onClick={onGenerateInsight}
            className="px-3 py-1.5 rounded bg-black text-white text-xs"
          >
            Insight
          </button>

        </div>
      </div>

      {/* OUTPUT */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">

        {loading && (
          <div className="p-6 text-sm text-gray-400">
            Génération en cours...
          </div>
        )}

        {!loading && !finalHtml && (
          <div className="p-6 text-sm text-gray-400">
            Sélectionne des contenus pour voir le rendu.
          </div>
        )}

        {!loading && finalHtml && (
          <iframe
            title="Preview"
            srcDoc={finalHtml}
            className="w-full h-full"
          />
        )}

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
