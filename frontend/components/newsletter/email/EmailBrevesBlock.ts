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
    .map((b) => {
      const imageUrl = buildContentImageUrl(b.visual_rect_id);
      const breveUrl = `${PUBLIC_SITE_URL}/news?news_id=${b.id}`;

      const tags = renderEmailTags({
        topics: b.topics,
        companies: b.companies || (b.company ? [b.company] : []),
        styles: b.styles || (b.news_type ? [b.news_type] : []),
      });

      return `
<tr>
<td colspan="2" style="
    padding:28px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      ${
        imageUrl
          ? `
          <td width="110" valign="top" style="padding-right:20px;">
            <a href="${breveUrl}" target="_blank" style="text-decoration:none;">
              <img src="${imageUrl}"
                   width="90"
                   style="display:block;border-radius:8px;" />
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
              font-weight:700;
              margin-bottom:8px;
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
                margin-top:10px;
                line-height:1.6;
              ">
                ${escapeHtml(b.excerpt)}
              </div>
            `
            : ""
        }

        <div style="margin-top:10px;">
          <a href="${breveUrl}"
             target="_blank"
             style="
                font-size:13px;
                font-weight:600;
                color:#111827;
                text-decoration:none;
             ">
             Lire →
          </a>
        </div>

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
<td colspan="2" style="
    padding-top:36px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:16px;
    ">
    Brèves
  </div>
</td>
</tr>

${rows}
`;
}
