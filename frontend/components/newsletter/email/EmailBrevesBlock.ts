import type { NewsletterNewsItem } from "@/types/newsletter";
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

export function EmailBrevesBlock(breves: NewsletterNewsItem[]) {
  if (!breves.length) return "";

  return (
    renderSectionTitle("Brèves") +
    breves
      .map(
        (b) => `
<tr>
<td colspan="2">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td valign="top" style="padding-bottom:22px;">

  <div style="font-size:12px;color:#6B7280;margin-bottom:6px;">
    ${formatDate(b.published_at)}
  </div>

  <div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:6px;">
    ${escapeHtml(b.title)}
  </div>

  ${
    b.excerpt
      ? `<div style="font-size:14px;line-height:20px;color:#374151;margin-bottom:8px;">
           ${escapeHtml(b.excerpt)}
         </div>`
      : ""
  }

</td>

${EmailMetaRight(b.topics, b.company, b.news_type)}

</tr>
</table>

</td>
</tr>`
      )
      .join("") +
    `
<tr>
<td colspan="2" style="padding-top:6px;padding-bottom:26px;">
  <a href="${PUBLIC_SITE_URL}/breves"
     style="font-size:13px;
            font-weight:600;
            color:#111827;
            text-decoration:none;
            border-bottom:1px solid #111827;">
    Lire toutes les brèves
  </a>
</td>
</tr>`
  );
}
