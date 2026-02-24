import { buildContentImageUrl } from "./EmailHelpers";

export function EmailBrevesBlock(breves: any[]) {
  if (!breves.length) return "";

  const rows = breves
    .map((b) => {
      const imageUrl = buildContentImageUrl(b.visual_rect_id);

      return `
<tr>
<td colspan="2" style="
    padding:24px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>

      <td width="120" valign="top" style="padding-right:16px;">
        ${
          imageUrl
            ? `<img src="${imageUrl}"
                   width="100"
                   style="display:block;border-radius:6px;" />`
            : ""
        }
      </td>

      <td valign="top">

        <div style="
            font-size:13px;
            font-weight:600;
            color:#111827;
            margin-bottom:6px;
          ">
          ${b.title}
        </div>

        ${
          b.excerpt
            ? `<div style="
                font-size:14px;
                color:#374151;
                line-height:1.5;
              ">
                ${b.excerpt}
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
    Brèves
  </div>
</td>
</tr>

${rows}

<tr>
<td colspan="2" style="
    padding-top:16px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <a href="https://ratecard.fr/breves"
     style="
        font-size:14px;
        font-weight:600;
        color:#111827;
        text-decoration:none;
     ">
     → Lire toutes les brèves
  </a>
</td>
</tr>
`;
}
