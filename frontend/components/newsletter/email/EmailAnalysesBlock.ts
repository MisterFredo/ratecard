import type { NewsletterAnalysisItem } from "@/types/newsletter";
import { escapeHtml, formatDate } from "./EmailHelpers";
import { EmailMetaRight } from "./EmailMetaRight";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

function renderSectionTitle(label: string) {
  return `
<tr>
<td colspan="2"
    style="padding:30px 0 14px 0;
           font-family:Arial,Helvetica,sans-serif;
           font-size:15px;
           font-weight:700;
           text-transform:uppercase;
           letter-spacing:0.6px;
           color:#111827;">
  ${label}
</td>
</tr>`;
}

export function EmailAnalysesBlock(
  analyses: NewsletterAnalysisItem[]
) {
  if (!analyses.length) return "";

  return (
    renderSectionTitle("Analyses") +
    analyses
      .map(
        (a) => `
<tr>
<td colspan="2">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td valign="top" style="padding-bottom:28px;">

  <div style="font-size:12px;color:#6B7280;margin-bottom:6px;">
    ${formatDate(a.published_at)}
  </div>

  <div style="font-size:17px;font-weight:600;color:#111827;margin-bottom:8px;">
    ${escapeHtml(a.title)}
  </div>

  ${
    a.excerpt
      ? `<div style="font-size:14px;line-height:21px;color:#374151;margin-bottom:12px;">
           ${escapeHtml(a.excerpt)}
         </div>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/analysis?analysis_id=${a.id}"
     style="font-size:13px;
            font-weight:600;
            color:#111827;
            text-decoration:none;
            border-bottom:1px solid #111827;">
    Lire l’analyse complète
  </a>

</td>

${EmailMetaRight(undefined, undefined, undefined)}

</tr>
</table>

</td>
</tr>`
      )
      .join("")
  );
}
