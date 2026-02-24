"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

import { SITE_URL } from "@/lib/site";

/* ========================================================= */
/* ENV SAFE                                                  */
/* ========================================================= */

const GCS_BASE_URL =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

/* ========================================================= */
/* HELPERS                                                   */
/* ========================================================= */

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
  });
}

function buildContentImageUrl(filename?: string | null) {
  if (!filename) return null;

  if (filename.startsWith("http")) return filename;

  return `${GCS_BASE_URL}/content/${filename}`;
}

/* ========================================================= */

export default function ClientNewsletterPreview({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
}: {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
}) {
  const html = useMemo(() => {

    const headerImageUrl = buildContentImageUrl(
      headerConfig.imageUrl
    );

    return `
<div style="
  font-family:Arial,Helvetica,sans-serif;
  font-size:14px;
  line-height:20px;
  color:#111827;
">

  ${
    headerImageUrl
      ? `
      <div style="margin-bottom:20px;">
        <img 
          src="${headerImageUrl}" 
          alt="" 
          style="max-width:100%;height:auto;"
        />
      </div>
      `
      : ""
  }

  ${
    headerConfig.title
      ? `
      <h2 style="margin:0 0 4px 0;">
        ${escapeHtml(headerConfig.title)}
      </h2>
      `
      : ""
  }

  ${
    headerConfig.subtitle
      ? `
      <div style="
        font-size:13px;
        color:#6B7280;
        margin-bottom:18px;
      ">
        ${escapeHtml(headerConfig.subtitle)}
      </div>
      `
      : ""
  }

  ${
    introText
      ? `<p style="margin-bottom:20px;">
          ${escapeHtml(introText).replace(/\n/g, "<br/>")}
        </p>`
      : ""
  }

  ${
    news.length
      ? `
      <h3 style="margin:24px 0 10px 0;">Actualités</h3>

      ${news
        .map((n) => {
          const imageUrl = buildContentImageUrl(
            n.visual_rect_id
          );

          const metaParts = [
            n.company?.name,
            n.news_type,
            formatDate(n.published_at),
          ].filter(Boolean);

          return `
          <div style="margin-bottom:18px;">

            ${
              imageUrl
                ? `<img src="${imageUrl}"
                     style="max-width:100%;
                            height:auto;
                            margin-bottom:8px;" />`
                : ""
            }

            ${
              metaParts.length
                ? `<div style="
                    font-size:12px;
                    color:#6B7280;
                    margin-bottom:4px;
                  ">
                    ${escapeHtml(metaParts.join(" • "))}
                  </div>`
                : ""
            }

            <div style="
              font-weight:bold;
              margin-bottom:4px;
            ">
              ${escapeHtml(n.title)}
            </div>

            ${
              n.excerpt
                ? `<div style="margin-bottom:6px;">
                    ${escapeHtml(n.excerpt)}
                  </div>`
                : ""
            }

            <a href="${SITE_URL}/news?news_id=${n.id}"
               style="color:#2563EB;text-decoration:none;">
              Lire →
            </a>
          </div>
        `;
        })
        .join("")}
    `
      : ""
  }

  ${
    breves.length
      ? `
      <h3 style="margin:28px 0 10px 0;">Brèves</h3>

      ${breves
        .map((b) => {
          const imageUrl = buildContentImageUrl(
            b.visual_rect_id
          );

          return `
          <div style="margin-bottom:16px;">

            ${
              imageUrl
                ? `<img src="${imageUrl}"
                     style="max-width:100%;
                            height:auto;
                            margin-bottom:6px;" />`
                : ""
            }

            <div style="font-weight:bold;">
              ${escapeHtml(b.title)}
            </div>

            ${
              b.excerpt
                ? `<div style="margin:4px 0;">
                    ${escapeHtml(b.excerpt)}
                  </div>`
                : ""
            }

            <a href="${SITE_URL}/breves?breve_id=${b.id}"
               style="color:#2563EB;text-decoration:none;">
              Lire →
            </a>
          </div>
        `;
        })
        .join("")}
    `
      : ""
  }

  ${
    analyses.length
      ? `
      <h3 style="margin:28px 0 10px 0;">
        Analyses Ratecard
      </h3>

      ${analyses
        .map(
          (a) => `
          <div style="margin-bottom:18px;">
            <div style="font-weight:bold;">
              ${escapeHtml(a.title)}
            </div>

            ${
              a.excerpt
                ? `<div style="margin:4px 0 6px 0;">
                    ${escapeHtml(a.excerpt)}
                  </div>`
                : ""
            }

            <a href="${SITE_URL}/analysis?analysis_id=${a.id}"
               style="color:#111827;text-decoration:none;font-weight:bold;">
              Lire l’analyse →
            </a>
          </div>
        `
        )
        .join("")}
    `
      : ""
  }

</div>
`;
  }, [headerConfig, introText, news, breves, analyses]);

  function copyHtml() {
    navigator.clipboard.writeText(html);
    alert("Version client copiée.");
  }

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">
          Version client
        </h2>

        <button
          onClick={copyHtml}
          className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs"
        >
          Copier version client
        </button>
      </div>

      <div className="border rounded-lg p-4 bg-white text-sm">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
