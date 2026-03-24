"use client";

import { useMemo, useRef } from "react";
import type { FeedItem } from "@/types/feed";

/* =========================================================
   SIMPLE BUILDER (FIABLE)
========================================================= */

function buildEmailCurator(items: FeedItem[], insight?: string) {

  const news = items.filter(i => i.type === "news");
  const analyses = items.filter(i => i.type === "analysis");

  function renderBadges(item: FeedItem) {
    return `
      <div style="margin:6px 0;">
        ${(item.companies || []).map((c:any)=>`
          <span style="background:#eef2ff;color:#3730a3;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px;">
            ${c.name}
          </span>
        `).join("")}

        ${(item.topics || []).map((t:any)=>`
          <span style="background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:6px;font-size:11px;margin-right:4px;">
            ${t.label}
          </span>
        `).join("")}
      </div>
    `;
  }

  function renderItem(item: FeedItem) {
    return `
      <div style="padding:12px 0;border-bottom:1px solid #eee;">
        <div style="font-weight:600;">${item.title}</div>
        ${renderBadges(item)}
        <div style="color:#555;">${item.excerpt || ""}</div>
      </div>
    `;
  }

  let html = `
    <div style="font-family:Arial;max-width:680px;margin:auto;padding:20px;">
      <h2 style="margin-bottom:20px;">Veille personnalisée</h2>
  `;

  /* INSIGHT */

  if (insight) {
    html += `
      <div style="background:#f9fafb;padding:12px;margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:8px;">Points clés</div>
        ${insight.split("\n").map(l => l.trim() ? `<div>• ${l}</div>` : "").join("")}
      </div>
    `;
  }

  /* NEWS */

  if (news.length) {
    html += `<h3>News</h3>`;
    html += news.map(renderItem).join("");
  }

  /* ANALYSES */

  if (analyses.length) {
    html += `<h3 style="margin-top:20px;">Analyses</h3>`;
    html += analyses.map(renderItem).join("");
  }

  html += `</div>`;

  return html;
}

/* ========================================================= */

type Props = {
  items: FeedItem[];
  insight?: string;
  loading: boolean;
  onGenerateInsight: () => void;
};

export default function SelectionPanel({
  items,
  insight,
  loading,
  onGenerateInsight,
}: Props) {

  const hiddenRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    if (!items.length) return "";
    return buildEmailCurator(items, insight);
  }, [items, insight]);

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

  return (
    <section className="space-y-4 h-full flex flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Preview ({items.length})
        </h2>

        <div className="flex gap-2">

          <button
            onClick={copyHtml}
            className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded"
          >
            Copier
          </button>

          <button
            onClick={copyForGmail}
            className="px-3 py-1.5 border text-xs rounded"
          >
            Gmail
          </button>

          <button
            onClick={onGenerateInsight}
            className="px-3 py-1.5 bg-black text-white text-xs rounded"
          >
            Insight
          </button>

        </div>
      </div>

      {/* OUTPUT */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-white">

        {loading && (
          <div className="p-6 text-gray-400">
            Génération...
          </div>
        )}

        {!loading && html && (
          <iframe
            title="Preview"
            srcDoc={html}
            className="w-full h-full"
          />
        )}

        {!loading && !html && (
          <div className="p-6 text-gray-400">
            Sélectionne du contenu
          </div>
        )}

      </div>

      <div
        ref={hiddenRef}
        style={{ position: "absolute", left: "-9999px" }}
      />
    </section>
  );
}
