"use client";

import { useMemo } from "react";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

import { SITE_URL } from "@/lib/site";

/* ========================================================= */

type HeaderConfig = {
  title: string;
  subtitle: string;
  imageUrl: string;
  mode: "ratecard" | "client";
};

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
    return `
<div style="
  font-family:Arial,Helvetica,sans-serif;
  font-size:14px;
  line-height:20px;
  color:#111827;
">

  ${
    headerConfig.imageUrl
      ? `
      <div style="margin-bottom:24px;">
        <img 
          src="${headerConfig.imageUrl}" 
          alt="" 
          style="max-width:100%;height:auto;border-radius:4px;"
        />
      </div>
      `
      : ""
  }

  ${
    headerConfig.title
      ? `
      <h2 style="margin:0 0 6px 0;">
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
        margin-bottom:24px;
      ">
        ${escapeHtml(headerConfig.subtitle)}
      </div>
      `
      : ""
  }

  ${
    introText
      ? `<p style="margin-bottom:24px;">
          ${escapeHtml(introText).replace(/\n/g, "<br/>")}
        </p>`
      : ""
  }

  ${
    news.length
      ? `
      <h3 style="margin:28px 0 12px 0;">Actualités</h3>

      ${news
        .map((n) => {
          const metaParts = [
            n.company?.name,
            n.news_type,
            formatDate(n.published_at),
          ].filter(Boolean);

          return `
          <div style="margin-bottom:20px;">
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
      <h3 style="margin:32px 0 12px 0;">Brèves</h3>

      ${breves
        .map(
          (b) => `
          <div style="margin-bottom:16px;">
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
        `
        )
        .join("")}
    `
      : ""
  }

  ${
    analyses.length
      ? `
      <h3 style="margin:32px 0 12px 0;">
        Analyses Ratecard
      </h3>

      ${analyses
        .map(
          (a) => `
          <div style="margin-bottom:20px;">
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
    <section className="space-y-4">
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

      <div className="border rounded-lg p-5 bg-white text-sm">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
