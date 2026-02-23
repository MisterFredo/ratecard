"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* =========================================================
   CONFIG
========================================================= */

const PUBLIC_SITE_URL = "https://ratecard.fr";
const GCS_BASE_URL =
  "https://storage.googleapis.com/ratecard-media";

const LOGO_URL =
  `${GCS_BASE_URL}/brand/ratecard-logo.jpeg`;

/* ========================================================= */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function resolveImageUrl(
  visualRectId?: string | null,
  companyVisualRectId?: string | null
) {
  if (visualRectId) {
    return `${GCS_BASE_URL}/news/${visualRectId}`;
  }
  if (companyVisualRectId) {
    return `${GCS_BASE_URL}/companies/${companyVisualRectId}`;
  }
  return null;
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
  });
}

/* =========================================================
   BLOCKS
========================================================= */

function renderIntro(introText?: string) {
  if (!introText) return "";

  return `
  <tr>
    <td style="
      padding:0 0 30px 0;
      font-family:Arial,Helvetica,sans-serif;
      font-size:15px;
      line-height:22px;
      color:#111827;
    ">
      ${escapeHtml(introText).replace(/\n/g, "<br/>")}
    </td>
  </tr>`;
}

/* ------------------ NEWS ------------------ */

function renderNews(news: NewsletterNewsItem[]) {
  if (!news.length) return "";

  const items = news
    .map((n) => {
      const imageUrl = resolveImageUrl(
        n.visual_rect_id,
        n.company_visual_rect_id
      );

      const metaParts = [
        n.company?.name,
        n.news_type,
        formatDate(n.published_at),
      ].filter(Boolean);

      return `
      <tr>
        <td style="padding:22px 0;border-bottom:1px solid #E5E7EB;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>

              ${
                imageUrl
                  ? `
              <td width="120" valign="top" style="padding-right:16px;">
                <img
                  src="${imageUrl}"
                  width="120"
                  style="display:block;width:120px;height:auto;border-radius:6px;"
                />
              </td>`
                  : ""
              }

              <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">

                <div style="
                  font-size:12px;
                  color:#6B7280;
                  margin-bottom:6px;
                ">
                  ${escapeHtml(metaParts.join(" • "))}
                </div>

                <div style="
                  font-size:16px;
                  font-weight:bold;
                  line-height:22px;
                  color:#111827;
                  margin-bottom:6px;
                ">
                  ${escapeHtml(n.title)}
                </div>

                ${
                  n.excerpt
                    ? `<div style="
                        font-size:14px;
                        line-height:20px;
                        color:#374151;
                        margin-bottom:10px;
                      ">
                        ${escapeHtml(n.excerpt)}
                      </div>`
                    : ""
                }

                <a href="${PUBLIC_SITE_URL}/news?news_id=${n.id}"
                   style="
                     font-size:13px;
                     color:#2563EB;
                     text-decoration:none;
                     font-weight:bold;
                   ">
                  Lire →
                </a>

              </td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");

  return `
  <tr>
    <td style="
      padding:30px 0 12px 0;
      font-family:Arial,Helvetica,sans-serif;
      font-size:18px;
      font-weight:bold;
      color:#111827;
    ">
      Actualités
    </td>
  </tr>
  ${items}`;
}

/* ------------------ BREVES ------------------ */

function renderBreves(breves: NewsletterNewsItem[]) {
  if (!breves.length) return "";

  const items = breves
    .map(
      (b) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #F3F4F6;">
          <div style="font-size:14px;font-weight:bold;color:#111827;">
            ${escapeHtml(b.title)}
          </div>

          ${
            b.excerpt
              ? `<div style="font-size:13px;color:#6B7280;margin-top:4px;">
                  ${escapeHtml(b.excerpt)}
                </div>`
              : ""
          }

          <a href="${PUBLIC_SITE_URL}/breves?breve_id=${b.id}"
             style="font-size:12px;color:#2563EB;text-decoration:none;">
            Lire →
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `
  <tr>
    <td style="
      padding:32px 0 12px 0;
      font-family:Arial,Helvetica,sans-serif;
      font-size:18px;
      font-weight:bold;
      color:#111827;
    ">
      Brèves
    </td>
  </tr>
  ${items}`;
}

/* ------------------ ANALYSES ------------------ */

function renderAnalyses(analyses: NewsletterAnalysisItem[]) {
  if (!analyses.length) return "";

  const items = analyses
    .map(
      (a) => `
      <tr>
        <td style="padding:22px 0;border-bottom:1px solid #E5E7EB;">
          <div style="font-size:16px;font-weight:bold;color:#111827;">
            ${escapeHtml(a.title)}
          </div>

          ${
            a.excerpt
              ? `<div style="font-size:14px;color:#374151;margin:6px 0 8px 0;">
                  ${escapeHtml(a.excerpt)}
                </div>`
              : ""
          }

          <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
             style="
               font-size:13px;
               font-weight:bold;
               color:#111827;
               text-decoration:none;
             ">
            Lire l’analyse →
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `
  <tr>
    <td style="
      padding:36px 0 12px 0;
      font-family:Arial,Helvetica,sans-serif;
      font-size:18px;
      font-weight:bold;
      color:#111827;
    ">
      Analyses Ratecard
    </td>
  </tr>
  ${items}`;
}

/* ========================================================= */

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
}) {
  const html = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<base target="_blank" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0"
  style="max-width:640px;margin:0 auto;padding:40px 20px;">

<tr>
<td style="padding-bottom:30px;">
<img src="${LOGO_URL}"
     width="150"
     style="display:block;width:150px;height:auto;" />
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
    alert("HTML copié.");
  }

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">
          Preview newsletter
        </h2>

        <button
          onClick={copyHtml}
          className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs"
        >
          Copier HTML
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <iframe
          title="Newsletter preview"
          srcDoc={html}
          className="w-full h-[820px]"
        />
      </div>
    </section>
  );
}
