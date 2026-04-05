import type { NewsletterAnalysisItem } from "@/types/newsletter";
import {
  escapeHtml,
  formatDate,
  renderEmailTags,
} from "./EmailHelpers";

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

function renderSectionTitle(label: string) {
  return `
<tr>
<td style="
    padding:32px 0 12px 0;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:12px;
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:0.12em;
      color:#6B7280;
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
    .map((a, index) => {
      const url = `${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}`;
      const safeUrl = escapeHtml(url);

      const tags = renderEmailTags({
        topics: a.topics,
        companies: a.companies || (a.company ? [a.company] : []),
        styles: a.styles || ["ANALYSE"],
      });

      return `
<tr>
<td style="
  padding:16px 0;
  border-bottom:${index === analyses.length - 1 ? "none" : "1px solid #F3F4F6"};
  font-family:Arial,Helvetica,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td valign="top">

        <!-- DATE -->
        <div style="
          font-size:12px;
          color:#6B7280;
          margin-bottom:4px;
        ">
          ${formatDate(a.published_at) || ""}
        </div>

        <!-- TITLE -->
        <a href="${safeUrl}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:14px;
            font-weight:600;
            color:#111827;
            line-height:1.35;
            margin-bottom:4px;
          ">
            ${escapeHtml(a.title)}
          </div>
        </a>

        ${
          tags
            ? `
        <div style="margin-bottom:4px;">
          ${tags}
        </div>
        `
            : ""
        }

        ${
          a.excerpt
            ? `
        <div style="
          font-size:13px;
          line-height:1.4;
          color:#6B7280;
        ">
          ${escapeHtml(a.excerpt)}
        </div>
        `
            : ""
        }

        <!-- CTA -->
        <div style="margin-top:6px;">
          <a href="${safeUrl}"
             target="_blank"
             style="
              font-size:12px;
              font-weight:600;
              color:#111827;
              text-decoration:none;
              border-bottom:1px solid #111827;
              padding-bottom:1px;
             ">
            Lire l’analyse →
          </a>
        </div>

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
