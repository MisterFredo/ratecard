import type { NewsletterAnalysisItem } from "@/types/newsletter";
import { escapeHtml, formatDate } from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

function renderSectionTitle(label: string) {
  return `
<tr>
<td colspan="2"
    style="padding:36px 0 16px 0;
           font-family:Arial,Helvetica,sans-serif;
           font-size:13px;
           font-weight:700;
           text-transform:uppercase;
           letter-spacing:0.08em;
           color:#111827;">
  ${label}
</td>
</tr>`;
}

export function EmailAnalysesBlock(
  analyses: NewsletterAnalysisItem[]
) {
  if (!analyses.length) return "";

  const rows = analyses
    .map(
      (a) => `
<tr>
<td colspan="2" style="
    padding:28px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      <!-- TEXT ONLY (premium editorial look) -->
      <td valign="top">

        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:8px;
          ">
          ${formatDate(a.published_at)}
        </div>

        <div style="
            font-size:20px;
            font-weight:700;
            color:#111827;
            margin-bottom:10px;
            line-height:1.3;
          ">
          ${escapeHtml(a.title)}
        </div>

        ${
          a.excerpt
            ? `<div style="
                font-size:15px;
                line-height:1.6;
                color:#374151;
                margin-bottom:16px;
              ">
                ${escapeHtml(a.excerpt)}
              </div>`
            : ""
        }

        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
           style="
              font-size:14px;
              font-weight:600;
              color:#111827;
              text-decoration:none;
              border-bottom:1px solid #111827;
              padding-bottom:2px;
           ">
          Lire l’analyse complète
        </a>

      </td>

    </tr>
  </table>

</td>
</tr>
`
    )
    .join("");

  return renderSectionTitle("Analyses") + rows;
}
