"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

/* ========================================================= */
/* ENV SAFE CONSTANTS                                        */
/* ========================================================= */

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

const GCS_BASE_URL =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

const LOGO_URL =
  `${GCS_BASE_URL}/brand/ratecard-logo.jpeg`;

/* ========================================================= */

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

/* ========================================================= */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ========================================================= */
/* HELPERS                                                   */
/* ========================================================= */

function buildContentImageUrl(filename?: string | null) {
  if (!filename) return null;

  // si déjà URL absolue → on la garde
  if (filename.startsWith("http")) return filename;

  return `${GCS_BASE_URL}/news/${filename}`;
}

/* ========================================================= */

export default function NewsletterPreview({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
}: Props) {
  const html = useMemo(() => {

    /* ==============================================
       HEADER
    ============================================== */

    const headerImageUrl = buildContentImageUrl(
      headerConfig.imageUrl
    );

    const headerBlock = `
    <tr>
    <td style="padding:20px 0 12px 0;">
      ${
        headerConfig.mode === "ratecard"
          ? `<img src="${LOGO_URL}" alt="Ratecard"
               style="display:block;width:150px;height:auto;" />`
          : ""
      }
    </td>
    </tr>

    <tr>
    <td style="padding-bottom:12px;
               font-family:Arial,Helvetica,sans-serif;">
      <h1 style="margin:0;
                 font-size:20px;
                 color:#111827;">
        ${escapeHtml(headerConfig.title)}
      </h1>

      ${
        headerConfig.subtitle
          ? `<p style="margin:6px 0 0 0;
                      font-size:13px;
                      color:#6B7280;">
              ${escapeHtml(headerConfig.subtitle)}
            </p>`
          : ""
      }
    </td>
    </tr>

    ${
      headerImageUrl
        ? `
    <tr>
    <td style="padding-bottom:20px;">
      <img src="${headerImageUrl}"
           style="display:block;
                  width:100%;
                  height:auto;" />
    </td>
    </tr>`
        : ""
    }
    `;
    /* ==============================================
       INTRO
    ============================================== */

    function renderIntro() {
      if (!introText) return "";

      return `
<tr>
<td style="padding:0 0 18px 0;
           font-family:Arial,Helvetica,sans-serif;
           font-size:14px;
           line-height:20px;
           color:#111827;">
  ${escapeHtml(introText).replace(/\n/g, "<br/>")}
</td>
</tr>
`;
    }

    /* ==============================================
       SECTION TITLE
    ============================================== */

    function renderSectionTitle(label: string) {
      return `
<tr>
<td style="padding:24px 0 8px 0;
           font-size:16px;
           font-weight:bold;
           color:#111827;">
  ${label}
</td>
</tr>
`;
    }

    /* ==============================================
       NEWS
    ============================================== */

    function renderNewsBlock() {
      if (!news.length) return "";

      return (
        renderSectionTitle("Actualités") +
        news
          .map((n) => {
            const imageUrl = buildContentImageUrl(
              n.visual_rect_id
            );

            return `
<tr>
<td style="padding:0 0 18px 0;">

  ${
    imageUrl
      ? `<img src="${imageUrl}"
           style="display:block;
                  width:100%;
                  height:auto;
                  margin-bottom:10px;" />`
      : ""
  }

  <strong>${escapeHtml(n.title)}</strong>

  ${
    n.excerpt
      ? `<p style="margin:6px 0 8px 0;
                   font-size:13px;
                   color:#374151;">
           ${escapeHtml(n.excerpt)}
         </p>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/news?news_id=${n.id}"
     style="color:#2563EB;
            text-decoration:none;
            font-weight:bold;">
    Lire l’article
  </a>

</td>
</tr>`;
          })
          .join("")
      );
    }

    /* ==============================================
       BRÈVES
    ============================================== */

    function renderBrevesBlock() {
      if (!breves.length) return "";

      return (
        renderSectionTitle("Brèves") +
        breves
          .map(
            (b) => `
<tr>
<td style="padding:0 0 14px 0;">
  <strong>${escapeHtml(b.title)}</strong><br/>
  <a href="${PUBLIC_SITE_URL}/breves?breve_id=${b.id}"
     style="font-size:13px;
            color:#2563EB;">
    Lire →
  </a>
</td>
</tr>`
          )
          .join("")
      );
    }

    /* ==============================================
       ANALYSES
    ============================================== */

    function renderAnalysesBlock() {
      if (!analyses.length) return "";

      return (
        renderSectionTitle("Analyses Ratecard") +
        analyses
          .map(
            (a) => `
<tr>
<td style="padding:0 0 18px 0;">
  <strong>${escapeHtml(a.title)}</strong>

  ${
    a.excerpt
      ? `<p style="margin:6px 0 8px 0;
                   font-size:13px;
                   color:#374151;">
           ${escapeHtml(a.excerpt)}
         </p>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
     style="color:#111827;
            font-weight:bold;">
    Lire l’analyse complète
  </a>
</td>
</tr>`
          )
          .join("")
      );
    }

    /* ==============================================
       FINAL HTML
    ============================================== */

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
<table width="100%" cellpadding="0" cellspacing="0"
       style="max-width:600px;margin:0 auto;">
${headerBlock}
${renderIntro()}
${renderNewsBlock()}
${renderBrevesBlock()}
${renderAnalysesBlock()}
</table>
</td>
</tr>
</table>
</body>
</html>
`;
  }, [headerConfig, introText, news, breves, analyses]);

  function copyHtml() {
    navigator.clipboard.writeText(html);
    alert("HTML copié.");
  }

  return (
    <section className="space-y-3">
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
