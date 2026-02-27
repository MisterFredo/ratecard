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
<td style="
    padding:32px 0;
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
            class="stack-column"
            style="
              width:130px;
              padding-right:22px;
              vertical-align:top;
            "
          >
            <a href="${breveUrl}" target="_blank" style="text-decoration:none;">
              <img 
                src="${imageUrl}"
                alt=""
                class="responsive-img thumb-img"
                style="
                  display:block;
                  width:100%;
                  max-width:110px;
                  border-radius:8px;
                "
              />
            </a>
          </td>
          `
          : ""
      }

      <!-- TEXT COLUMN -->
      <td
        valign="top"
        class="stack-column"
        style="
          vertical-align:top;
        "
      >

        <!-- TITLE -->
        <a href="${breveUrl}"
           target="_blank"
           style="text-decoration:none;color:#111827;">
          <div style="
              font-size:17px;
              font-weight:700;
              margin-bottom:10px;
              line-height:1.35;
            ">
            ${escapeHtml(b.title)}
          </div>
        </a>

        <!-- TAGS -->
        <div style="margin-bottom:8px;">
          ${tags}
        </div>

        <!-- EXCERPT -->
        ${
          b.excerpt
            ? `
            <div style="
                font-size:15px;
                color:#374151;
                margin-top:10px;
                line-height:1.2;
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
    padding-top:40px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:22px;
    ">
    Brèves
  </div>
</td>
</tr>

${rows}
`;
}
