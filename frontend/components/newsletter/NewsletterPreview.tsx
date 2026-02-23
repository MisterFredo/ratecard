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

type HeaderConfig = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mode: "ratecard" | "client";
};

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

    const headerBlock = `
<tr>
<td style="padding:24px 0 16px 0;">
  ${
    headerConfig.mode === "ratecard"
      ? `<img src="${LOGO_URL}" alt="Ratecard"
           style="display:block;width:150px;height:auto;" />`
      : ""
  }
</td>
</tr>

<tr>
<td style="padding-bottom:16px;
           font-family:Arial,Helvetica,sans-serif;">
  <h1 style="margin:0;
             font-size:22px;
             color:#111827;">
    ${escapeHtml(headerConfig.title)}
  </h1>

  ${
    headerConfig.subtitle
      ? `<p style="margin:8px 0 0 0;
                  font-size:14px;
                  color:#6B7280;">
          ${escapeHtml(headerConfig.subtitle)}
        </p>`
      : ""
  }
</td>
</tr>

${
  headerConfig.imageUrl
    ? `
<tr>
<td style="padding-bottom:24px;">
  <img src="${headerConfig.imageUrl}"
       style="display:block;
              width:100%;
              height:auto;
              border-radius:8px;" />
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
<td style="padding:0 0 24px 0;
           font-family:Arial,Helvetica,sans-serif;
           font-size:15px;
           line-height:22px;
           color:#111827;">
  ${escapeHtml(introText).replace(
    /\n/g,
    "<br/>"
  )}
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
<td style="padding:32px 0 12px 0;
           font-size:18px;
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
          .map(
            (n) => `
<tr>
<td style="padding:0 0 20px 0;">
  <strong>${escapeHtml(
    n.title
  )}</strong>

  ${
    n.excerpt
      ? `<p style="margin:6px 0 10px 0;
                   font-size:14px;
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
</tr>`
          )
          .join("")
      );
    }

    /* ==============================================
       BREVES
    ============================================== */

    function renderBrevesBlock() {
      if (!breves.length) return "";

      return (
        renderSectionTitle("Brèves") +
        breves
          .map(
            (b) => `
<tr>
<td style="padding:0 0 16px 0;">
  <strong>${escapeHtml(
    b.title
  )}</strong><br/>
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
<td style="padding:0 0 20px 0;">
  <strong>${escapeHtml(
    a.title
  )}</strong>

  ${
    a.excerpt
      ? `<p style="margin:6px 0 10px 0;
                   font-size:14px;
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
