import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

export function EmailHeaderGmail(
  headerConfig: HeaderConfig
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `
<!-- TOP SIGNATURE BAR -->
<tr>
  <td style="
      height:6px;
      background:#84CC16;
      line-height:6px;
      font-size:0;
    ">
    &nbsp;
  </td>
</tr>

<tr>
  <td style="
      padding:36px 24px 32px 24px;
      background:#FFFFFF;
      border-bottom:1px solid #E5E7EB;
      font-family:Arial,Helvetica,sans-serif;
      text-align:center;
    ">

    ${
      logo
        ? `
        <div style="margin-bottom:24px;">
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
        </div>
        `
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
            margin-bottom:14px;
            font-weight:600;
          ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>
        `
        : ""
    }

    ${
      headerConfig.title
        ? `
        <table role="presentation" width="100%">
          <tr>
            <td align="center">
              <div style="
                  font-size:28px;
                  font-weight:700;
                  color:#111827;
                  line-height:1.25;
                  margin-bottom:${headerConfig.period ? "10px" : "14px"};
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
            font-size:18px;
            font-weight:700;
            color:#84CC16;
            line-height:1.3;
            margin-bottom:6px;
          ">
          ${escapeHtml(headerConfig.period)}
        </div>
        `
        : ""
    }

  </td>
</tr>
`;
}
