export function EmailNewsBlockGmail(
  news: NewsletterNewsItem[]
) {
  if (!news.length) return "";

  const rows = news
    .map((n) => {
      const imageUrl = buildContentImageUrl(
        n.visual_rect_id
      );

      const newsUrl = `${PUBLIC_SITE_URL}/news?news_id=${n.id}`;

      const tags = renderEmailTags({
        topics: n.topics,
        companies: n.company ? [n.company] : [],
        styles: n.news_type ? [n.news_type] : [],
      });

      return `
<tr>
<td style="
  padding:28px 0;
  border-bottom:1px solid #E5E7EB;
  font-family:Arial,Helvetica,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${
        imageUrl
          ? `
      <!-- IMAGE -->
      <td
        width="140"
        valign="top"
        style="
          width:140px;
          padding-right:16px;
        "
      >
        <a href="${newsUrl}" target="_blank">
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

        <!-- DATE -->
        <div style="
          font-size:12px;
          color:#6B7280;
          margin-bottom:6px;
        ">
          ${new Date(n.published_at).toLocaleDateString("fr-FR")}
        </div>

        <!-- TITLE -->
        <a href="${newsUrl}" target="_blank" style="text-decoration:none;">
          <div style="
            font-size:18px;
            font-weight:700;
            color:#111827;
            line-height:1.3;
            margin-bottom:8px;
          ">
            ${escapeHtml(n.title)}
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
          n.excerpt
            ? `
        <!-- EXCERPT -->
        <div style="
          font-size:14px;
          color:#374151;
          line-height:1.4;
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
  padding-top:32px;
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
