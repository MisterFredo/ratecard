import {
  buildContentImageUrl,
  escapeHtml,
  renderEmailTags,
} from "./EmailHelpers";

import type { NewsletterNewsItem } from "@/types/newsletter";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

export function EmailBrevesBlockGmail(
  breves: NewsletterNewsItem[]
) {
  if (!breves.length) return "";

  const rows = breves
    .map((b) => {
      const imageUrl = buildContentImageUrl(
        b.visual_rect_id
      );

      const breveUrl = `${PUBLIC_SITE_URL}/news?news_id=${b.id}`;

      const tags = renderEmailTags({
        topics: b.topics,
        companies: b.company ? [b.company] : [],
        styles: b.news_type ? [b.news_type] : [],
      });

      return `
<div style="
    margin-bottom:28px;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      ${
        imageUrl
          ? `
          <td width="85" valign="top" style="padding-right:14px;">
            <a href="${breveUrl}" target="_blank">
              <img src="${imageUrl}"
                   width="75"
                   style="display:block;border-radius:6px;" />
            </a>
          </td>
          `
          : ""
      }

      <td valign="top">

        <a href="${breveUrl}"
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:16px;
              font-weight:600;
              margin-bottom:6px;
              line-height:1.35;
            ">
            ${escapeHtml(b.title)}
          </div>
        </a>

        <div style="margin-bottom:6px;">
          ${tags}
        </div>

        ${
          b.excerpt
            ? `
            <div style="
                font-size:14px;
                color:#374151;
                line-height:1.6;
                margin-bottom:6px;
              ">
              ${escapeHtml(b.excerpt)}
            </div>
            `
            : ""
        }

        <a href="${breveUrl}"
           target="_blank"
           style="
              font-size:13px;
              color:#6B7280;
              text-decoration:none;
           ">
          Lire →
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
    margin:36px 0 18px 0;
    text-transform:uppercase;
    letter-spacing:0.06em;
  ">
  Brèves
</div>

${rows}
`;
}
