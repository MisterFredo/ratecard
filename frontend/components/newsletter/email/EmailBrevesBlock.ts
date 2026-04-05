import type { NewsletterNewsItem } from "@/types/newsletter";
import {
  buildContentImageUrl,
  escapeHtml,
  renderEmailTags,
} from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

export function EmailBrevesBlock(breves: any[]) {
  if (!breves.length) return "";

  const rows = breves
    .map((b, index) => {
      const imageUrl = buildContentImageUrl(b.visual_rect_id);
      const breveUrl = `${PUBLIC_SITE_URL}/news?news_id=${b.id}`;

      const tags = renderEmailTags({
        topics: b.topics,
        companies: b.companies || (b.company ? [b.company] : []),
        styles: b.styles || (b.news_type ? [b.news_type] : []),
      });

      return `
<tr>
<td style="
  padding:18px 0;
  border-bottom:${index === breves.length - 1 ? "none" : "1px solid #F3F4F6"};
  font-family:Arial,Helvetica,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${
        imageUrl
          ? `
      <!-- IMAGE -->
      <td
        width="120"
        valign="top"
        style="
          width:120px;
          padding-right:14px;
        "
      >
        <a href="${breveUrl}" target="_blank">

          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="
                background:#FFFFFF;
              ">
                <img 
                  src="${imageUrl}"
                  alt=""
                  width="100"
                  border="0"
                  style="
                    display:block;
                    width:100%;
                    max-width:100px;
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

        <!-- TITLE -->
        <a href="${breveUrl}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:15px;
            font-weight:600;
            color:#374151;
            line-height:1.35;
            margin-bottom:6px;
          ">
            ${escapeHtml(b.title)}
          </div>
        </a>

        ${
          tags
            ? `
        <div style="
          margin-bottom:6px;
          opacity:0.8;
        ">
          ${tags}
        </div>
        `
            : ""
        }

        ${
          b.excerpt
            ? `
        <div style="
          font-size:13px;
          color:#6B7280;
          line-height:1.4;
        ">
          ${escapeHtml(b.excerpt)}
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
  padding-top:28px;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:11px;
    font-weight:600;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:#9CA3AF;
    margin-bottom:12px;
  ">
    Brèves
  </div>
</td>
</tr>

${rows}
`;
}
