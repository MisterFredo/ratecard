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
  padding:0;
  background:#F9FAFB;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- CONTAINER -->
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:48px 32px 40px 32px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="
          margin-bottom:28px;
          text-align:center;
        ">
          
          <div style="
            display:inline-block;
            padding:12px 20px;
            background:#FFFFFF;
            border:1px solid #E5E7EB;
            border-radius:8px;
          ">
            <img src="${logo}" style="
              display:block;
              max-width:140px;
              max-height:40px;
              width:auto;
              height:auto;
            " />
          </div>

        </div>`
        : ""
    }

    ${
      headerConfig.subtitle
        ? `
        <div style="
          font-size:11px;
          letter-spacing:0.22em;
          text-transform:uppercase;
          color:#9CA3AF;
          margin-bottom:16px;
          text-align:center;
        ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>`
        : ""
    }

    ${
      headerConfig.title
        ? `
        <div style="
          font-size:34px;
          font-weight:800;
          color:#111827;
          line-height:1.2;
          margin-bottom:14px;
          text-align:center;
        ">
          ${escapeHtml(headerConfig.title)}
        </div>`
        : ""
    }

    ${
      headerConfig.period
        ? `
        <div style="
          font-size:18px;
          font-weight:700;
          color:${headerConfig.periodColor || "#84CC16"};
          margin-bottom:18px;
          text-align:center;
        ">
          ${escapeHtml(headerConfig.period)}
        </div>

        <!-- ACCENT LINE -->
        <div style="
          width:40px;
          height:3px;
          background:${headerConfig.periodColor || "#84CC16"};
          margin:16px auto 24px auto;
        "></div>
        `
        : ""
    }

    ${
      introText
        ? `
        <div style="
          font-size:15px;
          color:#374151;
          max-width:520px;
          margin:0 auto;
          line-height:1.65;
          text-align:left;
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
