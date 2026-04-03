import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

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

<!-- HERO -->
<tr>
<td colspan="2" style="
    padding:40px 24px 36px 24px;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
    background:#FFFFFF;
    border-bottom:1px solid #E5E7EB;
  ">

  ${
    logo
      ? `
      <div style="margin-bottom:28px;">
        <img 
          src="${logo}"
          alt="${escapeHtml(headerConfig.headerCompany?.name || "logo")}"
          width="160"
          style="
            display:inline-block;
            height:auto;
            max-width:160px;
          "
        />
      </div>`
      : ""
  }

  ${
    headerConfig.subtitle
      ? `
      <div style="
          font-size:12px;
          letter-spacing:0.18em;
          text-transform:uppercase;
          color:#6B7280;
          margin-bottom:16px;
          font-weight:600;
        ">
        ${escapeHtml(headerConfig.subtitle)}
      </div>`
      : ""
  }

  ${
    headerConfig.title
      ? `
      <table role="presentation" width="100%">
        <tr>
          <td align="center">
            <div style="
                font-size:30px;
                font-weight:700;
                color:#111827;
                line-height:1.25;
                margin-bottom:${headerConfig.period ? "12px" : "16px"};
                max-width:600px;
              ">
              ${escapeHtml(headerConfig.title)}
            </div>
          </td>
        </tr>
      </table>
      `
      : ""
  }

  ${
    headerConfig.period
      ? `
      <div style="
          font-size:20px;
          font-weight:700;
          color:#84CC16;
          line-height:1.3;
          margin-bottom:8px;
        ">
        ${escapeHtml(headerConfig.period)}
      </div>`
      : ""
  }

  ${
    introText
      ? `
      <table role="presentation" width="100%">
        <tr>
          <td align="center">
            <div style="
                font-size:15px;
                color:#4B5563;
                line-height:1.6;
                max-width:560px;
                margin-top:20px;
                text-align:left;
              ">
              ${escapeHtml(introText).replace(/\n/g, "<br/>")}
            </div>
          </td>
        </tr>
      </table>
      `
      : ""
  }

</td>
</tr>
`;
}
