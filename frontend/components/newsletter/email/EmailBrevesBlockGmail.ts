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
    .map((b, index) => {
      const imageUrl = buildContentImageUrl(
        b.visual_rect_id
      );

      const breveUrl = `${PUBLIC_SITE_URL}/news?news_id=${b.id}`;

      const safeUrl = escapeHtml(breveUrl);

      const tags = renderEmailTags({
        topics: b.topics,
        companies:
          b.companies ||
          (b.company ? [b.company] : []),
        styles: b.news_type ? [b.news_type] : [],
      });

      return `
<tr>
<td style="
  padding:24px 0;
  border-bottom:${index === breves.length - 1 ? "none" : "1px solid #E5E7EB"};
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
        <a href="${safeUrl}" target="_blank" style="display:block;">
          <img 
            src="${imageUrl}"
            alt=""
            border="0"
            width="120"
            style="
              display:block;
              width:100%;
              max-width:120px;
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

        <!-- TITLE -->
        <a href="${safeUrl}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:16px;
            font-weight:600;
            color:#111827;
            line-height:1.3;
            margin-bottom:6px;
          ">
            ${escapeHtml(b.title)}
          </div>
        </a>

        ${
          tags
            ? `
        <!-- TAGS -->
        <div style="margin-bottom:6px;">
          ${tags}
        </div>
        `
            : ""
        }

        ${
          b.excerpt
            ? `
        <!-- EXCERPT -->
        <div style="
          font-size:14px;
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
    font-size:12px;
    font-weight:600;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:#6B7280;
    margin-bottom:14px;
  ">
    Brèves
  </div>
</td>
</tr>

${rows}
`;
}
