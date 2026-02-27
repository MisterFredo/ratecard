import type { HeaderConfig } from "@/types/newsletter";

export function EmailHeader(
  headerConfig: HeaderConfig,
  introText?: string
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `
<tr>
<td colspan="2" style="
    padding:32px 0 28px 0;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
  ">

  ${
    logo
      ? `<div style="margin-bottom:20px;">
          <img src="${logo}"
               width="180"
               style="display:inline-block;" />
        </div>`
      : ""
  }

  ${
    headerConfig.title
      ? `<div style="
          font-size:28px;
          font-weight:700;
          color:#111827;
          margin-bottom:8px;
          line-height:1.2;
        ">
          ${headerConfig.title}
        </div>`
      : ""
  }

  ${
    headerConfig.subtitle
      ? `<div style="
          font-size:15px;
          color:#6B7280;
          margin-bottom:16px;
        ">
          ${headerConfig.subtitle}
        </div>`
      : ""
  }

  ${
    introText
      ? `<div style="
          font-size:15px;
          color:#374151;
          line-height:1.6;
          max-width:560px;
          margin:0 auto;
          text-align:left;
        ">
          ${introText.replace(/\n/g, "<br/>")}
        </div>`
      : ""
  }

</td>
</tr>

<tr>
<td colspan="2" style="
    border-bottom:1px solid #E5E7EB;
  "></td>
</tr>
`;
}
