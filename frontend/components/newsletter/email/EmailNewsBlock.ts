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
    padding:44px 0;
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
              width:190px;
              padding-right:28px;
              vertical-align:top;
            "
          >
            <a href="${newsUrl}" target="_blank" style="text-decoration:none;">
              <img 
                src="${imageUrl}" 
                alt=""
                class="responsive-img thumb-img"
                style="
                  display:block;
                  width:100%;
                  max-width:180px;
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
        style="
          vertical-align:top;
        "
      >

        <!-- DATE -->
        <div style="
            font-size:12px;
            color:#9CA3AF;
            margin-bottom:10px;
            letter-spacing:0.02em;
          ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <!-- TITLE -->
        <a href="${newsUrl}" 
           target="_blank"
           style="text-decoration:none;color:#0F172A;">
          <div style="
              font-size:22px;
              font-weight:700;
              margin-bottom:14px;
              line-height:1.35;
            ">
            ${escapeHtml(n.title)}
          </div>
        </a>

        <!-- TAGS -->
        <div style="margin-bottom:14px;">
          ${tags}
        </div>

        <!-- EXCERPT -->
        ${
          n.excerpt
            ? `
            <div style="
                font-size:16px;
                color:#334155;
                line-height:1.7;
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
    padding-top:56px;
    padding-bottom:10px;
    font-family:Arial,Helvetica,sans-serif;
  ">
  <div style="
      font-size:12px;
      font-weight:700;
      letter-spacing:0.18em;
      text-transform:uppercase;
      color:#94A3B8;
      margin-bottom:28px;
    ">
    Actualités
  </div>
</td>
</tr>

${rows}
`;
}
