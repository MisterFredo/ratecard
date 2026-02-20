"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* =========================================================
   CONFIG
========================================================= */

import { SITE_URL } from "@/lib/site";
const LOGO_URL = `${SITE_URL}/assets/brand/ratecard-logo.jpeg`;

const GCS_BASE_URL =
  "https://storage.googleapis.com/ratecard-media";

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
   BLOCKS
========================================================= */

function renderIntro(introText?: string) {
  if (!introText) return "";

  return `
    <tr>
      <td style="
        padding:16px 0 24px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:15px;
        line-height:22px;
        color:#111827;
      ">
        ${escapeHtml(introText).replace(/\n/g, "<br/>")}
      </td>
    </tr>
  `;
}

/* -------------------------
   NEWS — CARDS
------------------------- */
function renderNews(news: NewsItem[]) {
  if (news.length === 0) return "";

  return `
    <tr>
      <td style="
        padding:24px 0 12px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:18px;
        font-weight:bold;
        color:#111827;
      ">
        Actualités
      </td>
    </tr>

    ${news
      .map(
        (n) => `
      <tr>
        <td style="padding:0 0 24px 0;">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              border:1px solid #E5E7EB;
              border-radius:8px;
              overflow:hidden;
            "
          >

            ${
              n.visual_rect_id
                ? `
            <tr>
              <td>
                <img
                  src="${GCS_BASE_URL}/news/${n.visual_rect_id}"
                  alt="${escapeHtml(n.title)}"
                  style="display:block;width:100%;height:auto;"
                />
              </td>
            </tr>
            `
                : ""
            }

            <tr>
              <td style="padding:16px;font-family:Arial,Helvetica,sans-serif;">
                <strong style="font-size:16px;line-height:22px;">
                  ${escapeHtml(n.title)}
                </strong>

                ${
                  n.excerpt
                    ? `<p style="
                        margin:8px 0 12px 0;
                        font-size:14px;
                        line-height:20px;
                        color:#374151;
                      ">
                        ${escapeHtml(n.excerpt)}
                      </p>`
                    : ""
                }

                <a
                  href="${SITE_URL}/news?news_id=${n.id}"
                  style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#2563EB;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:14px;
                    font-weight:bold;
                  "
                >
                  Lire l’article
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

/* -------------------------
   BRÈVES — LISTE ÉDITORIALE
------------------------- */
function renderBreves(breves: NewsItem[]) {
  if (breves.length === 0) return "";

  return `
    <tr>
      <td style="
        padding:32px 0 12px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:18px;
        font-weight:bold;
        color:#111827;
      ">
        Brèves du marché
      </td>
    </tr>

    ${breves
      .map(
        (b) => `
      <tr>
        <td style="
          padding:12px 0;
          font-family:Arial,Helvetica,sans-serif;
          border-bottom:1px solid #E5E7EB;
        ">
          <strong style="font-size:15px;line-height:21px;">
            ${escapeHtml(b.title)}
          </strong>

          ${
            b.excerpt
              ? `<p style="
                  margin:6px 0 10px 0;
                  font-size:14px;
                  line-height:20px;
                  color:#374151;
                ">
                  ${escapeHtml(b.excerpt)}
                </p>`
              : ""
          }

          <a
            href="${SITE_URL}/breves?breve_id=${b.id}"
            style="
              font-size:13px;
              color:#2563EB;
              text-decoration:none;
              font-weight:bold;
            "
          >
            Lire la brève →
          </a>
        </td>
      </tr>
    `
      )
      .join("")}
  `;
}

/* -------------------------
   ANALYSES — BLOCS
------------------------- */
function renderAnalyses(analyses: AnalysisItem[]) {
  if (analyses.length === 0) return "";

  return `
    <tr>
      <td style="
        padding:32px 0 12px 0;
        font-family:Arial,Helvetica,sans-serif;
        font-size:18px;
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
        <td style="padding:0 0 20px 0;">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background:#F9FAFB;border-radius:8px;"
          >
            <tr>
              <td style="padding:16px;font-family:Arial,Helvetica,sans-serif;">
                <strong style="font-size:16px;line-height:22px;">
                  ${escapeHtml(a.title)}
                </strong>

                ${
                  a.excerpt
                    ? `<p style="
                        margin:8px 0 12px 0;
                        font-size:14px;
                        line-height:20px;
                        color:#374151;
                      ">
                        ${escapeHtml(a.excerpt)}
                      </p>`
                    : ""
                }

                <a
                  href="${SITE_URL}/analysis?analysis_id=${a.id}"
                  style="
                    display:inline-block;
                    padding:10px 18px;
                    background:#111827;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:14px;
                    font-weight:bold;
                  "
                >
                  Lire l’analyse complète
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

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsletterPreview({
  introText,
  news,
  breves,
  analyses,
}: {
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
})
  const html = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <base target="_blank" />
  </head>

  <body style="margin:0;padding:0;background-color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="max-width:600px;margin:0 auto;"
          >
            <tr>
              <td style="padding:24px 0;">
                <img
                  src="${LOGO_URL}"
                  alt="Ratecard"
                  style="display:block;width:150px;height:auto;"
                />
              </td>
            </tr>

            ${renderIntro(introText)}
            ${renderNews(news)}
            ${renderBreves(breves)}
            ${renderAnalyses(analyses)}

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;
  }, [introText, news, breves, analyses]);

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
          className="w-full h-[760px]"
        />
      </div>
    </section>
  );
}
