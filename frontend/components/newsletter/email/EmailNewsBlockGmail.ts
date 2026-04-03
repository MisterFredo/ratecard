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
<tr>
<td style="
    padding:28px 16px;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${
        imageUrl
          ? `
          <!-- IMAGE -->
          <td
            valign="top"
            style="
              width:140px;
              padding-right:16px;
            "
          >
            <a href="${newsUrl}" target="_blank">
              <img 
                src="${imageUrl}" 
                alt=""
                width="140"
                style="
                  display:block;
                  width:100%;
                  max-width:140px;
                  height:auto;
                  border:1px solid #F3F4F6;
                "
              />
            </a>
          </td>
          `
          : ""
      }

      <!-- TEXT -->
      <td valign="top">

        <!-- DATE -->
        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:6px;
          ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <!-- TITLE -->
        <a href="${newsUrl}" 
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:18px;
              font-weight:700;
              margin-bottom:10px;
              line-height:1.3;
            ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        <!-- TAGS -->
        <div style="margin-bottom:8px;">
          ${tags}
        </div>

        <!-- EXCERPT -->
        ${
          n.excerpt
            ? `
            <div style="
                font-size:14px;
                color:#374151;
                line-height:1.4;
              ">
                ${escapeHtml(n.excerpt)}
              </div>
            `
            : ""
        }

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
    padding-top:32px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:18px;
      padding-left:8px;
    ">
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
