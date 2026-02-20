"use client";

import { useMemo } from "react";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

import { SITE_URL } from "@/lib/site";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function ClientNewsletterPreview({
  introText,
  news,
  breves,
  analyses,
}: {
  introText?: string;
  news: NewsItem[];
  breves: NewsItem[];
  analyses: AnalysisItem[];
}) {
  const html = useMemo(() => {
    return `
<div style="font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:20px;">

  ${
    introText
      ? `<p>${escapeHtml(introText).replace(/\n/g, "<br/>")}</p>`
      : ""
  }

  ${
    news.length
      ? `
  <h3>Actualités</h3>
  ${news
    .map(
      (n) => `
      <p>
        <strong>${escapeHtml(n.title)}</strong><br/>
        ${
          n.excerpt
            ? `${escapeHtml(n.excerpt)}<br/>`
            : ""
        }
        <a href="${SITE_URL}/news?news_id=${n.id}">
          Lire l’article
        </a>
      </p>
    `
    )
    .join("")}
  `
      : ""
  }

  ${
    breves.length
      ? `
  <h3>Brèves</h3>
  ${breves
    .map(
      (b) => `
      <p>
        <strong>${escapeHtml(b.title)}</strong><br/>
        ${
          b.excerpt
            ? `${escapeHtml(b.excerpt)}<br/>`
            : ""
        }
        <a href="${SITE_URL}/breves?breve_id=${b.id}">
          Lire la brève
        </a>
      </p>
    `
    )
    .join("")}
  `
      : ""
  }

  ${
    analyses.length
      ? `
  <h3>Analyses</h3>
  ${analyses
    .map(
      (a) => `
      <p>
        <strong>${escapeHtml(a.title)}</strong><br/>
        ${
          a.excerpt
            ? `${escapeHtml(a.excerpt)}<br/>`
            : ""
        }
        <a href="${SITE_URL}/analysis?analysis_id=${a.id}">
          Lire l’analyse
        </a>
      </p>
    `
    )
    .join("")}
  `
      : ""
  }

</div>
`;
  }, [introText, news, breves, analyses]);

  function copyHtml() {
    navigator.clipboard.writeText(html);
    alert("Version client copiée.");
  }

  return (
    <section className="space-y-3">
      <div className="flex justify-between">
        <h2 className="text-sm font-semibold">
          Version client
        </h2>

        <button
          onClick={copyHtml}
          className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
        >
          Copier version client
        </button>
      </div>

      <div className="border rounded p-4 text-sm bg-white">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
