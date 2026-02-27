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
    padding:48px 32px 40px 32px;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
    background:#F9FAFB;
  ">

  ${
    logo
      ? `<div style="margin-bottom:24px;">
          <img 
            src="${logo}"
            width="170"
            style="display:inline-block;height:auto;"
          />
        </div>`
      : ""
  }

  ${
    headerConfig.title
      ? `<div style="
          font-size:26px;
          font-weight:700;
          color:#111827;
          margin-bottom:16px;
          line-height:1.3;
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
          margin-bottom:18px;
        ">
          ${headerConfig.subtitle}
        </div>`
      : ""
  }

  ${
    introText
      ? `<div style="
          font-size:16px;
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
