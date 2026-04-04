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
          height:6px;
          background:${headerConfig.topBarColor || "#84CC16"};
        "></td>
      </tr>`
      : ""
  }

<tr>
<td colspan="2" style="
  padding:56px 28px 44px 28px;
  text-align:center;
  font-family:Arial,Helvetica,sans-serif;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
">

  ${
    logo
      ? `
      <div style="margin-bottom:28px;">
        <img src="${logo}" width="160" style="display:inline-block;" />
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
        margin-bottom:14px;
      ">
        ${escapeHtml(headerConfig.subtitle)}
      </div>`
      : ""
  }

  ${
    headerConfig.title
      ? `
      <div style="
        font-size:30px;
        font-weight:700;
        color:#111827;
        line-height:1.25;
        margin-bottom:12px;
      ">
        ${escapeHtml(headerConfig.title)}
      </div>`
      : ""
  }

  ${
    headerConfig.period
      ? `
      <div style="
        font-size:20px;
        font-weight:700;
        color:${headerConfig.periodColor || "#84CC16"};
        margin-bottom:12px;
      ">
        ${escapeHtml(headerConfig.period)}
      </div>`
      : ""
  }

  ${
    introText
      ? `
      <div style="
        font-size:15px;
        color:#4B5563;
        max-width:560px;
        margin:18px auto 0 auto;
        line-height:1.6;
        text-align:left;
      ">
        ${escapeHtml(introText).replace(/\n/g, "<br/>")}
      </div>`
      : ""
  }

</td>
</tr>
`;
}
