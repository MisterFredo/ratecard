import type { NewsletterNewsItem } from "@/types/newsletter";
import { escapeHtml, formatDate } from "./EmailHelpers";
import { EmailMetaRight } from "./EmailMetaRight";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

const GCS_BASE_URL =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

function buildContentImageUrl(filename?: string | null) {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${GCS_BASE_URL}/news/${filename}`;
}

function renderDivider() {
  return `
<tr>
<td colspan="2" style="padding:20px 0;">
  <div style="height:1px;background:#E5E7EB;"></div>
</td>
</tr>`;
}

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

export function EmailNewsBlock(news: NewsletterNewsItem[]) {
  if (!news.length) return "";

  return (
    renderSectionTitle("Actualités") +
    news
      .map((n, index) => {

        const imageUrl =
          buildContentImageUrl(n.visual_rect_id);

        return `
<tr>
<td colspan="2">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td valign="top" style="padding-bottom:26px;">

  ${
    imageUrl
      ? `<img src="${imageUrl}"
           style="
             display:block;
             width:100%;
             max-height:200px;
             object-fit:cover;
             margin-bottom:14px;
           " />`
      : ""
  }

  <div style="font-size:12px;color:#6B7280;margin-bottom:6px;">
    ${formatDate(n.published_at)}
  </div>

  <div style="
    font-size:17px;
    font-weight:600;
    color:#111827;
    margin-bottom:8px;">
    ${escapeHtml(n.title)}
  </div>

  ${
    n.excerpt
      ? `<div style="
           font-size:14px;
           line-height:21px;
           color:#374151;
           margin-bottom:12px;">
           ${escapeHtml(n.excerpt)}
         </div>`
      : ""
  }

  <a href="${PUBLIC_SITE_URL}/news?news_id=${n.id}"
     style="font-size:13px;
            font-weight:600;
            color:#111827;
            text-decoration:none;
            border-bottom:1px solid #111827;">
    Lire l’article
  </a>

</td>

${EmailMetaRight(n.topics, n.company, n.news_type)}

</tr>
</table>

</td>
</tr>

${index !== news.length - 1 ? renderDivider() : ""}`;
      })
      .join("")
  );
}
