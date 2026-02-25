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
    padding:36px 0;
    border-bottom:1px solid #F1F5F9;
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
              width:150px;
              padding-right:24px;
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
                  max-width:130px;
                  border-radius:10px;
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
        style="vertical-align:top;"
      >

        <!-- TITLE -->
        <a href="${breveUrl}"
           target="_blank"
           style="text-decoration:none;color:#0F172A;">
          <div style="
              font-size:18px;
              font-weight:700;
              margin-bottom:12px;
              line-height:1.4;
            ">
            ${escapeHtml(b.title)}
          </div>
        </a>

        <!-- TAGS -->
        <div style="margin-bottom:12px;">
          ${tags}
        </div>

        <!-- EXCERPT -->
        ${
          b.excerpt
            ? `
            <div style="
                font-size:15px;
                color:#334155;
                line-height:1.65;
              ">
                ${escapeHtml(b.excerpt)}
              </div>
            `
            : ""
        }

        <!-- CTA -->
        <div style="margin-top:16px;">
          <a href="${breveUrl}"
             target="_blank"
             style="
                font-size:13px;
                font-weight:600;
                color:#2563EB;
                text-decoration:none;
             ">
             Lire la brève →
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
<td style="
    padding-top:52px;
    padding-bottom:10px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:12px;
      font-weight:700;
      letter-spacing:0.18em;
      text-transform:uppercase;
      color:#94A3B8;
      margin-bottom:26px;
    ">
    Brèves
  </div>
</td>
</tr>

${rows}
`;
}
