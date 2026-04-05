import type { NewsletterAnalysisItem } from "@/types/newsletter";
import {
  escapeHtml,
  formatDate,
  renderEmailTags,
} from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

function renderSectionTitle(label: string) {
  return `
<tr>
<td style="
    padding:42px 0 18px 0;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:0.08em;
      color:#111827;
    ">
    ${label}
  </div>
</td>
</tr>`;
}

export function EmailAnalysesBlock(
  analyses: any[]
) {
  if (!analyses.length) return "";

  const rows = analyses
    .map((a) => {

      const url = `${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}`;

      /* 🔥 TAGS (même logique que News) */
      const tags = renderEmailTags({
        topics: a.topics,
        companies: a.companies || (a.company ? [a.company] : []),
        styles: a.styles || [],
      });

      return `
<tr>
<td style="
  padding:28px 0;
  border-bottom:1px solid #E5E7EB;
  font-family:Arial,Helvetica,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td valign="top">

        <!-- DATE -->
        <div style="
          font-size:12px;
          color:#6B7280;
          margin-bottom:8px;
        ">
          ${formatDate(a.published_at) || ""}
        </div>

        <!-- TITLE -->
        <a href="${url}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:20px;
            font-weight:700;
            color:#111827;
            line-height:1.35;
            margin-bottom:10px;
          ">
            ${escapeHtml(a.title)}
          </div>
        </a>

        ${
          tags
            ? `
        <!-- TAGS -->
        <div style="margin-bottom:10px;">
          ${tags}
        </div>
        `
            : ""
        }

        ${
          a.excerpt
            ? `
        <!-- EXCERPT -->
        <div style="
          font-size:15px;
          line-height:1.6;
          color:#374151;
          margin-bottom:14px;
        ">
          ${escapeHtml(a.excerpt)}
        </div>
        `
            : ""
        }

        <!-- CTA -->
        <a href="${url}"
           target="_blank"
           style="
            font-size:14px;
            font-weight:600;
            color:#111827;
            text-decoration:none;
            border-bottom:1px solid #111827;
            padding-bottom:2px;
           ">
          Lire l’analyse complète →
        </a>

      </td>
    </tr>
  </table>

</td>
</tr>
`;
    })
    .join("");

  return renderSectionTitle("Analyses") + rows;
}
