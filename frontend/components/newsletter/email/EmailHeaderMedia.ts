import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

export function EmailHeaderMedia(
  headerConfig: HeaderConfig,
  introText?: string
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `

  ${
    headerConfig.topBarEnabled !== false
      ? `
      <tr>
        <td colspan="2" style="
          height:4px;
          background:${headerConfig.topBarColor || "#84CC16"};
          line-height:4px;
          font-size:0;
        ">
          &nbsp;
        </td>
      </tr>`
      : ""
  }

<tr>
<td colspan="2" style="
  padding:0;
  background:#FFFFFF;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- CONTAINER -->
  <div style="
    max-width:640px;
    margin:0 auto;
    padding:28px 28px 24px 28px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="margin-bottom:14px;">
          <img src="${logo}" style="
            max-width:120px;
            max-height:32px;
            display:block;
          " />
        </div>`
        : ""
    }

    ${
      headerConfig.subtitle
        ? `
        <div style="
          font-size:11px;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#6B7280;
          margin-bottom:6px;
        ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>`
        : ""
    }

    ${
      headerConfig.title
        ? `
        <div style="
          font-size:26px;
          font-weight:700;
          color:#111827;
          line-height:1.25;
          margin-bottom:8px;
        ">
          ${escapeHtml(headerConfig.title)}
        </div>`
        : ""
    }

    ${
      headerConfig.period
        ? `
        <div style="
          font-size:14px;
          font-weight:600;
          color:${headerConfig.periodColor || "#84CC16"};
          margin-bottom:14px;
        ">
          ${escapeHtml(headerConfig.period)}
        </div>`
        : ""
    }

    <!-- ACCENT -->
    <div style="
      width:40px;
      height:3px;
      background:#111827;
      margin-bottom:16px;
    "></div>

    ${
      introText
        ? `
        <div style="
          font-size:14px;
          color:#4B5563;
          line-height:1.6;
          max-width:520px;
        ">
          ${escapeHtml(introText).replace(/\n/g, "<br/>")}
        </div>`
        : ""
    }

  </div>

</td>
</tr>
`;
}
