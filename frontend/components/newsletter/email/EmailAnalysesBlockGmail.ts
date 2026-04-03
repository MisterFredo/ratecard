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
  padding:26px 0;
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
          ${formatDate(a.published_at) || ""}
        </div>

        <!-- TITLE -->
        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
           target="_blank"
           style="text-decoration:none;">
           
          <table role="presentation" width="100%">
            <tr>
              <td>
                <div style="
                  font-size:20px;
                  font-weight:700;
                  color:#111827;
                  line-height:1.35;
                  margin-bottom:10px;
                ">
                  ${escapeHtml(a.title)}
                </div>
              </td>
            </tr>
          </table>

        </a>

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
        <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
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
`
    )
    .join("");

  return `
<tr>
<td style="
  padding:32px 0 14px 0;
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
