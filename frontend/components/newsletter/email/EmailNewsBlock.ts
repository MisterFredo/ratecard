import type { NewsletterNewsItem } from "@/types/newsletter";
import {
  buildContentImageUrl,
  escapeHtml,
  renderEmailTags,
} from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";


export function EmailNewsBlock(news: any[]) {
  if (!news.length) return "";

  const rows = news
    .map((n) => {
      const imageUrl = buildContentImageUrl(n.visual_rect_id);
      const newsUrl = `${PUBLIC_SITE_URL}/news?news_id=${n.id}`;

      const tags = renderEmailTags({
        topics: n.topics,
        companies: n.companies || (n.company ? [n.company] : []),
        styles: n.styles || (n.news_type ? [n.news_type] : []),
      });

      return `
<tr>
<td style="
  padding:32px 0;
  border-bottom:1px solid #E5E7EB;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${
        imageUrl
          ? `
      <!-- IMAGE -->
      <td
        width="180"
        valign="top"
        style="
          width:180px;
          padding-right:20px;
        "
      >
        <a href="${newsUrl}" target="_blank" style="text-decoration:none;">

          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="
                border:1px solid #F3F4F6;
                background:#FFFFFF;
                text-align:center;
                padding:8px;
              ">
                <img 
                  src="${imageUrl}" 
                  alt=""
                  width="140"
                  border="0"
                  style="
                    display:block;
                    width:100%;
                    max-width:140px;
                    height:auto;
                  "
                />
              </td>
            </tr>
          </table>

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
          margin-bottom:8px;
          font-family:Arial,Helvetica,sans-serif;
        ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <!-- TITLE -->
        <a href="${newsUrl}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:20px;
            font-weight:700;
            color:#111827;
            line-height:1.35;
            margin-bottom:10px;
            font-family:Arial,Helvetica,sans-serif;
          ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        <!-- TAGS -->
        ${
          tags
            ? `
        <div style="margin-bottom:8px;">
          ${tags}
        </div>
        `
            : ""
        }

        <!-- EXCERPT -->
        ${
          n.excerpt
            ? `
        <div style="
          font-size:15px;
          color:#374151;
          line-height:1.5;
          font-family:Arial,Helvetica,sans-serif;
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
  padding-top:36px;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:13px;
    font-weight:700;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:#111827;
    margin-bottom:18px;
  ">
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
