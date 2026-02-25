import type { NewsletterAnalysisItem } from "@/types/newsletter";
import { escapeHtml, formatDate } from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

function renderSectionTitle(label: string) {
  return `
<tr>
<td style="
    padding-top:60px;
    padding-bottom:14px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:12px;
      font-weight:700;
      letter-spacing:0.18em;
      text-transform:uppercase;
      color:#94A3B8;
      margin-bottom:28px;
    ">
    ${label}
  </div>
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
<td style="
    padding:46px 0;
    border-bottom:1px solid #F1F5F9;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td valign="top">

        <!-- DATE -->
        <div style="
            font-size:12px;
            color:#9CA3AF;
            margin-bottom:12px;
            letter-spacing:0.02em;
          ">
          ${formatDate(a.published_at)}
        </div>

        <!-- TITLE -->
        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
           target="_blank"
           style="text-decoration:none;color:#0F172A;">
          <div style="
              font-size:24px;
              font-weight:700;
              line-height:1.35;
              margin-bottom:18px;
            ">
            ${escapeHtml(a.title)}
          </div>
        </a>

        <!-- EXCERPT -->
        ${
          a.excerpt
            ? `
            <div style="
                font-size:17px;
                line-height:1.75;
                color:#334155;
                margin-bottom:24px;
              ">
                ${escapeHtml(a.excerpt)}
              </div>
            `
            : ""
        }

        <!-- CTA -->
        <div style="margin-top:4px;">
          <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
             target="_blank"
             style="
                font-size:14px;
                font-weight:600;
                color:#2563EB;
                text-decoration:none;
             ">
            Lire l’analyse complète →
          </a>
        </div>

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
