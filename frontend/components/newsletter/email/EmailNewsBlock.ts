import { buildContentImageUrl, escapeHtml } from "./EmailHelpers";

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ratecard.fr";

export function EmailNewsBlock(news: any[]) {
  if (!news.length) return "";

  const rows = news
    .map((n) => {
      const imageUrl = buildContentImageUrl(n.visual_rect_id);
      const newsUrl = `${PUBLIC_SITE_URL}/news?news_id=${n.id}`;

      const badges =
        n.topics?.map(
          (t: any) => `
          <span style="
              display:inline-block;
              font-size:11px;
              padding:3px 8px;
              margin-right:6px;
              margin-top:6px;
              background:#F3F4F6;
              color:#374151;
              border-radius:12px;
              font-weight:500;
            ">
            ${escapeHtml(t.label)}
          </span>
        `
        ).join("") || "";

      return `
<tr>
<td colspan="2" style="
    padding:32px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      <!-- IMAGE -->
      <td width="150" valign="top" style="padding-right:22px;">
        ${
          imageUrl
            ? `
            <a href="${newsUrl}" target="_blank" style="text-decoration:none;">
              <img src="${imageUrl}" 
                   width="130"
                   style="display:block;border-radius:8px;" />
            </a>
            `
            : ""
        }
      </td>

      <!-- TEXT -->
      <td valign="top">

        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:8px;
          ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <a href="${newsUrl}" 
           target="_blank"
           style="
              text-decoration:none;
              color:#111827;
           ">
          <div style="
              font-size:19px;
              font-weight:700;
              margin-bottom:10px;
              line-height:1.35;
            ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        ${badges}

        ${
          n.excerpt
            ? `<div style="
                font-size:15px;
                color:#374151;
                margin-top:12px;
                line-height:1.6;
              ">
                ${escapeHtml(n.excerpt)}
              </div>`
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
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
