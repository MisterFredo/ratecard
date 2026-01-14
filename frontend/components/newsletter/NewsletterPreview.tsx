"use client";

import { useMemo } from "react";
import type { NewsItem, AnalysisItem } from "@/app/(admin)/admin/newsletter/compose/page";

/* =========================================================
   CONFIG
========================================================= */

// ⚠️ Domaine réellement accessible (iframe + Brevo)
const SITE_URL = "https://ratecard-frontend.onrender.com";
const LOGO_URL = `${SITE_URL}/assets/brand/ratecard-logo.jpeg`;

/* =========================================================
   UTILS
========================================================= */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   BLOCK RENDERERS
========================================================= */

function renderIntro(introText?: string) {
  if (!introText) return "";

  return `
    <tr>
      <td style="
        padding:16px 0 24px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:14px;
        line-height:20px;
        color:#111827;
      ">
        ${escapeHtml(introText).replace(/\n/g, "<br/>")}
      </td>
    </tr>
  `;
}

function renderNews(news: NewsItem[]) {
  if (news.length === 0) return "";

  return `
    <tr>
      <td style="
        padding:24px 0 12px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:16px;
        font-weight:bold;
        color:#111827;
      ">
        Actualités partenaires
      </td>
    </tr>

    ${news
      .map(
        (n) => `
      <tr>
        <td style="padding:16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #E5E7EB;padding-bottom:16px;">
            <tr>
              <td width="170" valign="top">
                <img
                  src="${n.visual_rect_url}"
                  alt="${escapeHtml(n.title)}"
                  width="160"
                  style="display:block;border-radius:6px;"
                />
              </td>

              <td valign="top" style="
                padding-left:16px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:14px;
                line-height:20px;
                color:#111827;
              ">
                <strong style="font-size:15px;">
                  ${escapeHtml(n.title)}
                </strong><br/>

                ${
                  n.excerpt
                    ? `<span style="color:#374151;">${escapeHtml(n.excerpt)}</span><br/>`
                    : ""
                }

                <a
                  href="${SITE_URL}/news?news_id=${n.id}"
                  style="
                    display:inline-block;
                    margin-top:8px;
                    padding:6px 12px;
                    background:#2563EB;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:4px;
                    font-size:13px;
                  "
                >
                  Lire la news
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
      )
      .join("")}
  `;
}

function renderAnalyses(analyses: AnalysisItem[]) {
  if (analyses.length === 0) return "";

  return `
    <tr>
      <td style="
        padding:32px 0 12px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:16px;
        font-weight:bold;
        color:#111827;
      ">
        Analyses Ratecard
      </td>
    </tr>

    ${analyses
      .map(
        (a) => `
      <tr>
        <td style="
          padding:14px 0;
          font-family:Arial,Helvetica,sans-serif;
          font-size:14px;
          line-height:20px;
          color:#111827;
          border-bottom:1px solid #E5E7EB;
        ">
          <strong style="font-size:15px;">
            ${escapeHtml(a.title)}
          </strong><br/>

          ${
            a.excerpt
              ? `<span style="color:#374151;">${escapeHtml(a.excerpt)}</span><br/>`
              : ""
          }

          <a
            href="${SITE_URL}/analysis?analysis_id=${a.id}"
            style="
              display:inline-block;
              margin-top:8px;
              padding:6px 12px;
              background:#111827;
              color:#ffffff;
              text-decoration:none;
              border-radius:4px;
              font-size:13px;
            "
          >
            Lire l’analyse
          </a>
        </td>
      </tr>
    `
      )
      .join("")}
  `;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsletterPreview({
  introText,
  news,
  analyses,
}: {
  introText?: string;
  news: NewsItem[];
  analyses: AnalysisItem[];
}) {
  const html = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <base target="_blank" />
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" align="center">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0">

            <!-- LOGO -->
            <tr>
              <td style="padding:24px 0;">
                <img
                  src="${LOGO_URL}"
                  alt="Ratecard"
                  width="150"
                  style="display:block;"
                />
              </td>
            </tr>

            ${renderIntro(introText)}

            ${renderNews(news)}

            ${renderAnalyses(analyses)}

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  }, [introText, news, analyses]);

  function copyHtml() {
    navigator.clipboard.writeText(html);
    alert("HTML de la newsletter copié. Collez-le dans Brevo.");
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Preview newsletter
        </h2>

        <button
          onClick={copyHtml}
          className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
        >
          Copier le HTML
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <iframe
          title="Newsletter preview"
          srcDoc={html}
          className="w-full h-[720px]"
        />
      </div>
    </section>
  );
}
