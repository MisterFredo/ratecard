"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

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

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildContentImageUrl(filename?: string | null) {
  if (!filename) return null;
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

    /* ======================================================
       HELPERS
    ====================================================== */

    function renderDivider() {
      return `
<tr>
<td style="padding:20px 0;">
  <div style="height:1px;background:#E5E7EB;"></div>
</td>
</tr>`;
    }

    function renderSectionTitle(label: string) {
      return `
<tr>
<td style="
  padding:28px 0 12px 0;
  font-family:Arial,Helvetica,sans-serif;
  font-size:15px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:0.5px;
  color:#111827;">
  ${label}
</td>
</tr>`;
    }

    function renderTopicsBadges(topics?: any[]) {
      if (!topics?.length) return "";

      return `
<div style="margin-bottom:8px;">
${topics
  .map(
    (t) => `
<span style="
  display:inline-block;
  font-size:11px;
  font-family:Arial,Helvetica,sans-serif;
  padding:4px 8px;
  margin:0 6px 6px 0;
  border:1px solid #E5E7EB;
  border-radius:3px;
  color:#374151;
  background:#F9FAFB;">
  ${escapeHtml(t.LABEL || t.label || "")}
</span>`
  )
  .join("")}
</div>`;
    }

    function renderMeta(date?: string) {
      return `
<div style="
  font-size:12px;
  font-family:Arial,Helvetica,sans-serif;
  color:#6B7280;
  margin-bottom:6px;">
  ${formatDate(date)}
</div>`;
    }

    /* ======================================================
       BAROMÈTRE (bloc statique pour l’instant)
    ====================================================== */

    function renderStatsBlock() {
      return `
<tr>
<td style="
  padding:18px 0 22px 0;
  font-family:Arial,Helvetica,sans-serif;
  border-bottom:1px solid #E5E7EB;">

  <div style="
    font-size:13px;
    font-weight:700;
    margin-bottom:10px;">
    Baromètre 30 jours
  </div>

  <div style="
    font-size:13px;
    line-height:20px;
    color:#374151;">
    • +24 actualités publiées<br/>
    • 6 analyses stratégiques<br/>
    • 3 tendances dominantes sur le Retail Media
  </div>

</td>
</tr>`;
    }

    /* ======================================================
       NEWS
    ====================================================== */

    function renderNewsBlock() {
      if (!news.length) return "";

      return (
        renderSectionTitle("Actualités") +
        news
          .map((n, index) => {
            const imageUrl = buildContentImageUrl(
              n.visual_rect_id
            );

            return `
<tr>
<td style="padding:0 0 24px 0;">

  ${
    imageUrl
      ? `<img src="${imageUrl}"
           style="
             display:block;
             width:100%;
             max-height:220px;
             object-fit:cover;
             margin-bottom:14px;
             border-radius:4px;
           " />`
      : ""
  }

  ${renderMeta(n.published_at)}
  ${renderTopicsBadges(n.topics)}

  <div style="
    font-size:17px;
    font-weight:600;
    font-family:Arial,Helvetica,sans-serif;
    color:#111827;
    margin-bottom:8px;">
    ${escapeHtml(n.title)}
  </div>

  ${
    n.excerpt
      ? `<div style="
           font-size:14px;
           line-height:21px;
           font-family:Arial,Helvetica,sans-serif;
           color:#374151;
           margin-bottom:12px;">
           ${escapeHtml(n.excerpt)}
         </div>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/news?news_id=${n.id}"
     style="
       font-size:13px;
       font-weight:600;
       font-family:Arial,Helvetica,sans-serif;
       text-decoration:none;
       border-bottom:1px solid #111827;
       color:#111827;">
    Lire l’article
  </a>

</td>
</tr>

${index !== news.length - 1 ? renderDivider() : ""}`;
          })
          .join("")
      );
    }

    /* ======================================================
       BRÈVES
    ====================================================== */

    function renderBrevesBlock() {
      if (!breves.length) return "";

      return (
        renderSectionTitle("Brèves") +
        breves
          .map(
            (b) => `
<tr>
<td style="padding:0 0 18px 0;">

  ${renderMeta(b.published_at)}
  ${renderTopicsBadges(b.topics)}

  <div style="
    font-size:14px;
    font-family:Arial,Helvetica,sans-serif;
    font-weight:600;
    color:#111827;
    margin-bottom:6px;">
    ${escapeHtml(b.title)}
  </div>

  <a href="${PUBLIC_SITE_URL}/breves?breve_id=${b.id}"
     style="font-size:13px;color:#2563EB;text-decoration:none;">
    Lire →
  </a>

</td>
</tr>`
          )
          .join("")
      );
    }

    /* ======================================================
       ANALYSES
    ====================================================== */

    function renderAnalysesBlock() {
      if (!analyses.length) return "";

      return (
        renderSectionTitle("Analyses") +
        analyses
          .map(
            (a) => `
<tr>
<td style="padding:0 0 26px 0;">

  ${renderMeta(a.published_at)}

  <div style="
    font-size:17px;
    font-family:Arial,Helvetica,sans-serif;
    font-weight:600;
    color:#111827;
    margin-bottom:8px;">
    ${escapeHtml(a.title)}
  </div>

  ${
    a.excerpt
      ? `<div style="
           font-size:14px;
           line-height:21px;
           font-family:Arial,Helvetica,sans-serif;
           color:#374151;
           margin-bottom:12px;">
           ${escapeHtml(a.excerpt)}
         </div>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
     style="
       font-size:13px;
       font-weight:600;
       font-family:Arial,Helvetica,sans-serif;
       text-decoration:none;
       border-bottom:1px solid #111827;
       color:#111827;">
    Lire l’analyse complète
  </a>

</td>
</tr>`
          )
          .join("")
      );
    }

    /* ======================================================
       HTML FINAL
    ====================================================== */

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<base target="_blank" />
</head>
<body style="margin:0;padding:0;background:#F3F4F6;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0"
       style="max-width:640px;margin:0 auto;background:#ffffff;padding:0 28px;">

<tr>
<td style="padding:30px 0 18px 0;">
<img src="${LOGO_URL}" style="width:150px;height:auto;" />
</td>
</tr>

<tr>
<td style="
  font-family:Arial,Helvetica,sans-serif;
  font-size:22px;
  font-weight:700;
  color:#111827;
  padding-bottom:10px;">
  ${escapeHtml(headerConfig.title)}
</td>
</tr>

${
  headerConfig.subtitle
    ? `<tr>
<td style="font-size:14px;color:#6B7280;padding-bottom:18px;">
${escapeHtml(headerConfig.subtitle)}
</td>
</tr>`
    : ""
}

${
  introText
    ? `<tr>
<td style="font-size:15px;line-height:22px;color:#111827;padding-bottom:26px;">
${escapeHtml(introText).replace(/\n/g, "<br/>")}
</td>
</tr>`
    : ""
}

${renderStatsBlock()}
${renderNewsBlock()}
${renderBrevesBlock()}
${renderAnalysesBlock()}

<tr>
<td style="padding:40px 0 30px 0;font-size:12px;color:#9CA3AF;">
© Ratecard – Lecture stratégique du marché
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
`;
  }, [headerConfig, introText, news, breves, analyses]);

  return (
    <section>
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
