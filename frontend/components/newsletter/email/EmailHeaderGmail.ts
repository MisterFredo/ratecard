import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

export function EmailHeaderGmail(
  headerConfig: HeaderConfig,
  introText?: string // 👈 fallback legacy
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  // 🔥 priorité HTML editor
  const intro =
    headerConfig.introHtml ||
    (introText
      ? escapeHtml(introText).replace(/\n/g, "<br/>")
      : "");

  return `
<!-- TOP BAR -->
${
  headerConfig.topBarEnabled !== false
    ? `
<tr>
  <td style="
      height:6px;
      background:${headerConfig.topBarColor || "#84CC16"};
      line-height:6px;
      font-size:0;
    ">
    &nbsp;
  </td>
</tr>
`
    : ""
}

<tr>
  <td style="
      padding:56px 28px 44px 28px;
      background:#FFFFFF;
      border-bottom:1px solid #E5E7EB;
      font-family:Arial,Helvetica,sans-serif;
      text-align:center;
    ">

    ${
      logo
        ? `
        <div style="margin-bottom:32px;">
          <img 
            src="${logo}"
            alt="${escapeHtml(headerConfig.headerCompany?.name || "logo")}"
            width="170"
            style="display:inline-block;height:auto;"
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
            letter-spacing:0.20em;
            text-transform:uppercase;
            color:#6B7280;
            margin-bottom:16px;
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
                  font-size:32px;
                  font-weight:700;
                  color:#111827;
                  line-height:1.2;
                  margin-bottom:${headerConfig.period ? "12px" : "18px"};
                  max-width:640px;
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
            font-size:22px;
            font-weight:700;
            color:${headerConfig.periodColor || "#84CC16"};
            line-height:1.3;
            margin-bottom:10px;
          ">
          ${escapeHtml(headerConfig.period)}
        </div>
        `
        : ""
    }

    ${
      intro
        ? `
        <table role="presentation" width="100%">
          <tr>
            <td align="center">
              <div style="
                  font-size:15px;
                  color:#4B5563;
                  line-height:1.6;
                  max-width:560px;
                  margin-top:22px;
                  text-align:left;
                ">
                ${intro}
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
