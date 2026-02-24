import { buildContentImageUrl } from "./helpers";

export function EmailNewsBlock(news: any[]) {
  if (!news.length) return "";

  const rows = news
    .map((n) => {
      const imageUrl = buildContentImageUrl(n.visual_rect_id);

      const badges =
        n.topics?.map(
          (t: any) => `
          <span style="
              display:inline-block;
              font-size:11px;
              padding:2px 6px;
              margin-right:4px;
              margin-top:4px;
              background:#F3F4F6;
              color:#374151;
              border-radius:4px;
            ">
            ${t.label}
          </span>
        `
        ).join("") || "";

      return `
<tr>
<td colspan="2" style="
    padding:28px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      <!-- IMAGE -->
      <td width="160" valign="top" style="padding-right:20px;">
        ${
          imageUrl
            ? `<img src="${imageUrl}" 
                   width="140"
                   style="display:block;border-radius:6px;" />`
            : ""
        }
      </td>

      <!-- TEXT -->
      <td valign="top">

        <div style="
            font-size:12px;
            color:#6B7280;
            margin-bottom:6px;
          ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <div style="
            font-size:18px;
            font-weight:700;
            color:#111827;
            margin-bottom:8px;
            line-height:1.3;
          ">
          ${n.title}
        </div>

        ${badges}

        ${
          n.excerpt
            ? `<div style="
                font-size:14px;
                color:#374151;
                margin-top:10px;
                line-height:1.5;
              ">
                ${n.excerpt}
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
    padding-top:32px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.06em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:12px;
    ">
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
