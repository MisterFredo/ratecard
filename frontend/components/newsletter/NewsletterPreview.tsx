"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* ========================================================= */

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

/* ========================================================= */

type EditorialBlock =
  | (NewsletterNewsItem & { __type: "news" | "breve" })
  | (NewsletterAnalysisItem & {
      __type: "analysis";
    });

/* ========================================================= */

function renderEditorialBlock(item: EditorialBlock) {
  const isAnalysis = item.__type === "analysis";
  const isBreve = item.__type === "breve";
  const isNews = item.__type === "news";

  if (isAnalysis) {
    return `
      <tr>
        <td style="padding:26px 0;border-bottom:1px solid #E5E7EB;">
          <div style="
            font-size:16px;
            font-weight:bold;
            color:#111827;
            margin-bottom:6px;
          ">
            ${escapeHtml(item.title)}
          </div>

          ${
            item.excerpt
              ? `<div style="
                  font-size:14px;
                  line-height:20px;
                  color:#374151;
                  margin-bottom:8px;
                ">
                ${escapeHtml(item.excerpt)}
              </div>`
              : ""
          }

          <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${item.id}"
             style="
               font-size:13px;
               font-weight:bold;
               color:#111827;
               text-decoration:none;
             ">
            Lire l’analyse →
          </a>
        </td>
      </tr>
    `;
  }

  const imageUrl = resolveImageUrl(
    (item as any).visual_rect_id,
    (item as any).company_visual_rect_id
  );

  const metaParts = [
    (item as any).company?.name,
    (item as any).news_type,
    formatDate((item as any).published_at),
  ].filter(Boolean);

  return `
    <tr>
      <td style="padding:24px 0;border-bottom:1px solid #E5E7EB;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>

            ${
              imageUrl && !isBreve
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

              ${
                metaParts.length
                  ? `<div style="
                      font-size:12px;
                      color:#6B7280;
                      margin-bottom:6px;
                    ">
                      ${escapeHtml(
                        metaParts.join(" • ")
                      )}
                    </div>`
                  : ""
              }

              <div style="
                font-size:16px;
                font-weight:bold;
                line-height:22px;
                color:#111827;
                margin-bottom:6px;
              ">
                ${escapeHtml(item.title)}
              </div>

              ${
                item.excerpt
                  ? `<div style="
                      font-size:14px;
                      line-height:20px;
                      color:#374151;
                      margin-bottom:8px;
                    ">
                    ${escapeHtml(item.excerpt)}
                  </div>`
                  : ""
              }

              <a href="${
                isBreve
                  ? `${PUBLIC_SITE_URL}/breves?breve_id=${item.id}`
                  : `${PUBLIC_SITE_URL}/news?news_id=${item.id}`
              }"
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
    </tr>
  `;
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
  const editorialFlow: EditorialBlock[] =
    useMemo(() => {
      const mappedNews = news.map((n) => ({
        ...n,
        __type: "news" as const,
      }));

      const mappedBreves = breves.map((b) => ({
        ...b,
        __type: "breve" as const,
      }));

      const mappedAnalyses = analyses.map((a) => ({
        ...a,
        __type: "analysis" as const,
      }));

      return [
        ...mappedNews,
        ...mappedBreves,
        ...mappedAnalyses,
      ];
    }, [news, breves, analyses]);

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

${
  introText
    ? `
<tr>
<td style="
  padding-bottom:30px;
  font-family:Arial,Helvetica,sans-serif;
  font-size:15px;
  line-height:22px;
  color:#111827;
">
${escapeHtml(introText).replace(
  /\n/g,
  "<br/>"
)}
</td>
</tr>
`
    : ""
}

${editorialFlow
  .map((item) => renderEditorialBlock(item))
  .join("")}

</table>
</td>
</tr>
</table>
</body>
</html>
`;
  }, [introText, editorialFlow]);

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
          className="w-full h-[850px]"
        />
      </div>
    </section>
  );
}
