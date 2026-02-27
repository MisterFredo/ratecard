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
<!-- TOP SIGNATURE BAR -->
<tr>
  <td colspan="2" style="
      height:6px;
      background:#84CC16;
      line-height:6px;
      font-size:0;
    ">
    &nbsp;
  </td>
</tr>

<!-- HERO HEADER -->
<tr>
<td colspan="2" style="
    padding:64px 40px 56px 40px;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
    background:#FFFFFF;
    border-bottom:1px solid #E5E7EB;
  ">

  ${
    logo
      ? `<div style="margin-bottom:36px;">
          <img 
            src="${logo}"
            width="170"
            style="display:inline-block;height:auto;"
          />
        </div>`
      : ""
  }

  ${
    headerConfig.subtitle
      ? `<div style="
          font-size:12px;
          letter-spacing:0.18em;
          text-transform:uppercase;
          color:#6B7280;
          margin-bottom:18px;
          font-weight:600;
        ">
          ${headerConfig.subtitle}
        </div>`
      : ""
  }

  ${
    headerConfig.title
      ? `<div style="
          font-size:34px;
          font-weight:700;
          color:#111827;
          line-height:1.2;
          margin-bottom:14px;
          max-width:700px;
          margin-left:auto;
          margin-right:auto;
        ">
          ${headerConfig.title}
        </div>`
      : ""
  }

  ${
    headerConfig.headerCompany?.period_label
      ? `<div style="
          font-size:26px;
          font-weight:700;
          color:#84CC16;
          line-height:1.3;
          margin-bottom:10px;
        ">
          ${headerConfig.headerCompany.period_label}
        </div>`
      : ""
  }

  ${
    introText
      ? `<div style="
          font-size:16px;
          color:#4B5563;
          line-height:1.7;
          max-width:580px;
          margin:24px auto 0 auto;
          text-align:left;
        ">
          ${introText.replace(/\n/g, "<br/>")}
        </div>`
      : ""
  }

</td>
</tr>
`;
}
