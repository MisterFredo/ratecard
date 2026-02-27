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
    padding:36px 16px;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${
        imageUrl
          ? `
          <!-- IMAGE COLUMN -->
          <td
            valign="top"
            align="center"
            style="
              width:180px;
              padding-right:24px;
              vertical-align:top;
            "
          >
            <a href="${newsUrl}" target="_blank" style="text-decoration:none;">
              <div style="
                width:160px;
                height:120px;
                background:#FFFFFF;
                border:1px solid #F3F4F6;
                display:flex;
                align-items:center;
                justify-content:center;
              ">
                <img 
                  src="${imageUrl}" 
                  alt=""
                  style="
                    max-width:85%;
                    max-height:85%;
                    height:auto;
                    display:block;
                  "
                />
              </div>
            </a>
          </td>
          `
          : ""
      }

      <!-- TEXT COLUMN -->
      <td valign="top" style="vertical-align:top;">

        <!-- DATE -->
        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:8px;
          ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <!-- TITLE -->
        <a href="${newsUrl}" 
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:20px;
              font-weight:700;
              margin-bottom:12px;
              line-height:1.35;
            ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        <!-- TAGS -->
        <div style="margin-bottom:10px;">
          ${tags}
        </div>

        <!-- EXCERPT -->
        ${
          n.excerpt
            ? `
            <div style="
                font-size:15px;
                color:#374151;
                margin-top:10px;
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
    padding-top:42px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:22px;
      padding-left:8px;
    ">
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
