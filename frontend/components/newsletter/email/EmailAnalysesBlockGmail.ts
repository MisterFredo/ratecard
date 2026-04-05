import { escapeHtml, renderEmailTags } from "./EmailHelpers";
import type { NewsletterAnalysisItem } from "@/types/newsletter";

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
    .map((a, index) => {

      /* 🔥 SOURCE DE VÉRITÉ */
      const url = a.url || "#";

      /* 🔥 TAGS (aligné avec News / Brèves) */
      const tags = renderEmailTags({
        topics: a.topics,
        companies: a.companies || (a.company ? [a.company] : []),
        styles: a.styles || ["ANALYSE"],
      });

      return `
<tr>
<td style="
  padding:24px 0;
  border-bottom:${index === analyses.length - 1 ? "none" : "1px solid #E5E7EB"};
  font-family:Arial,Helvetica,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td valign="top">

        <!-- DATE -->
        <div style="
          font-size:12px;
          color:#6B7280;
          margin-bottom:6px;
        ">
          ${formatDate(a.published_at) || ""}
        </div>

        <!-- TITLE -->
        <a href="${url}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:19px;
            font-weight:700;
            color:#111827;
            line-height:1.35;
            margin-bottom:8px;
          ">
            ${escapeHtml(a.title)}
          </div>
        </a>

        ${
          tags
            ? `
        <!-- TAGS -->
        <div style="margin-bottom:8px;">
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
          font-size:14px;
          line-height:1.5;
          color:#374151;
          margin-bottom:12px;
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
            font-size:13px;
            font-weight:600;
            color:#111827;
            text-decoration:none;
            border-bottom:1px solid #111827;
            padding-bottom:1px;
           ">
          Lire l’analyse →
        </a>

      </td>
    </tr>
  </table>

</td>
</tr>
`;
    })
    .join("");

  return `
<tr>
<td style="
  padding:30px 0 12px 0;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:12px;
    font-weight:600;
    text-transform:uppercase;
    letter-spacing:0.12em;
    color:#6B7280;
  ">
    Analyses
  </div>
</td>
</tr>

${rows}
`;
}
