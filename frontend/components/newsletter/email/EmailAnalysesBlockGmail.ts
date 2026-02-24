import { escapeHtml } from "./EmailHelpers";
import type { NewsletterAnalysisItem } from "@/types/newsletter";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function EmailAnalysesBlockGmail(
  analyses: NewsletterAnalysisItem[]
) {
  if (!analyses.length) return "";

  const rows = analyses
    .map((a) => {
      const analysisUrl =
        `${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}`;

      return `
<div style="
    margin-bottom:40px;
  ">

  <a href="${analysisUrl}"
     target="_blank"
     style="text-decoration:none;color:#111827;">
    <div style="
        font-size:18px;
        font-weight:700;
        margin-bottom:6px;
        line-height:1.3;
      ">
      ${escapeHtml(a.title)}
    </div>
  </a>

  <div style="
      font-size:13px;
      color:#6B7280;
      margin-bottom:10px;
    ">
    ${formatDate(a.published_at)}
  </div>

  ${
    a.excerpt
      ? `
      <div style="
          font-size:15px;
          color:#374151;
          line-height:1.7;
          margin-bottom:12px;
        ">
        ${escapeHtml(a.excerpt)}
      </div>
      `
      : ""
  }

  <a href="${analysisUrl}"
     target="_blank"
     style="
        font-size:14px;
        font-weight:600;
        color:#111827;
        text-decoration:none;
     ">
     Lire l’analyse complète →
  </a>

</div>
`;
    })
    .join("");

  return `
<div style="
    font-size:13px;
    font-weight:600;
    color:#6B7280;
    margin:48px 0 20px 0;
    text-transform:uppercase;
    letter-spacing:0.06em;
  ">
  Analyses
</div>

${rows}
`;
}
