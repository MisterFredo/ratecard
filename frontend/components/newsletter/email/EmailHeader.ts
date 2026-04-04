import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

export function EmailHeader(
  headerConfig: HeaderConfig,
  introText?: string // ✅ fallback legacy
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  // 🔥 priorité au HTML editor, fallback texte
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
  <td colspan="2" style="
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

<!-- HERO -->
<tr>
<td colspan="2" style="
    padding:64px 32px 52px 32px;
    text-align:center;
    font-family:Arial,Helvetica,sans-serif;
    background:#FFFFFF;
    border-bottom:1px solid #E5E7EB;
  ">

  ${
    logo
      ? `
      <div style="margin-bottom:36px;">
        <img 
          src="${logo}"
          alt="${escapeHtml(headerConfig.headerCompany?.name || "logo")}"
          width="170"
          style="display:inline-block;height:auto;"
        />
      </div>`
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
          margin-bottom:18px;
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
                font-size:34px;
                font-weight:700;
                color:#111827;
                line-height:1.2;
                margin-bottom:${headerConfig.period ? "14px" : "20px"};
                max-width:680px;
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
          font-size:24px;
          font-weight:700;
          color:${headerConfig.periodColor || "#84CC16"};
          line-height:1.3;
          margin-bottom:12px;
        ">
        ${escapeHtml(headerConfig.period)}
      </div>`
      : ""
  }

  ${
    intro
      ? `
      <table role="presentation" width="100%">
        <tr>
          <td align="center">
            <div style="
                font-size:16px;
                color:#4B5563;
                line-height:1.7;
                max-width:580px;
                margin-top:26px;
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
