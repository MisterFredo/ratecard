import {
  buildContentImageUrl,
  escapeHtml,
  renderEmailTags,
} from "./EmailHelpers";

import type { NewsletterNewsItem } from "@/types/newsletter";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

export function EmailNewsBlockGmail(
  news: NewsletterNewsItem[]
) {
  if (!news.length) return "";

  const rows = news
    .map((n) => {
      const imageUrl = buildContentImageUrl(
        n.visual_rect_id
      );

      const newsUrl = `${PUBLIC_SITE_URL}/news?news_id=${n.id}`;

      const tags = renderEmailTags({
        topics: n.topics,
        companies: n.company ? [n.company] : [],
        styles: n.news_type ? [n.news_type] : [],
      });

      return `
<div style="
    margin-bottom:36px;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      ${
        imageUrl
          ? `
          <td width="100" valign="top" style="padding-right:16px;">
            <a href="${newsUrl}" target="_blank">
              <img src="${imageUrl}"
                   width="90"
                   style="display:block;border-radius:6px;" />
            </a>
          </td>
          `
          : ""
      }

      <td valign="top">

        <a href="${newsUrl}"
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:17px;
              font-weight:600;
              margin-bottom:6px;
              line-height:1.35;
            ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        <div style="margin-bottom:8px;">
          ${tags}
        </div>

        ${
          n.excerpt
            ? `
            <div style="
                font-size:15px;
                color:#374151;
                line-height:1.6;
                margin-bottom:8px;
              ">
              ${escapeHtml(n.excerpt)}
            </div>
            `
            : ""
        }

        <a href="${newsUrl}"
           target="_blank"
           style="
              font-size:14px;
              color:#6B7280;
              text-decoration:none;
           ">
          Lire l’article →
        </a>

      </td>

    </tr>
  </table>

</div>
`;
    })
    .join("");

  return `
<div style="
    font-size:13px;
    font-weight:600;
    color:#6B7280;
    margin-bottom:20px;
    text-transform:uppercase;
    letter-spacing:0.06em;
  ">
  Actualités
</div>

${rows}
`;
}
