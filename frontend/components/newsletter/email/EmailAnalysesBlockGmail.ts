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
    .map(
      (a) => `
<tr>
<td style="
    padding:28px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td valign="top" style="vertical-align:top;">

        <!-- DATE -->
        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:8px;
          ">
          ${formatDate(a.published_at)}
        </div>

        <!-- TITLE -->
        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:20px;
              font-weight:700;
              line-height:1.35;
              margin-bottom:12px;
            ">
            ${escapeHtml(a.title)}
          </div>
        </a>

        <!-- EXCERPT -->
        ${
          a.excerpt
            ? `
            <div style="
                font-size:15px;
                line-height:1.6;
                color:#374151;
                margin-bottom:16px;
              ">
                ${escapeHtml(a.excerpt)}
              </div>
            `
            : ""
        }

        <!-- CTA -->
        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
           target="_blank"
           style="
              display:inline-block;
              font-size:14px;
              font-weight:600;
              color:#111827;
              text-decoration:underline;
           ">
          Lire l’analyse complète →
        </a>

      </td>
    </tr>
  </table>

</td>
</tr>
`
    )
    .join("");

  return `
<tr>
<td style="
    padding:36px 0 16px 0;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.08em;
      color:#111827;
    ">
    Analyses
  </div>
</td>
</tr>

${rows}
`;
}
