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

  const heroImage = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/assets/brand/LeTouquet.jpg`;

  return `

  ${
    headerConfig.topBarEnabled !== false
      ? `
      <tr>
        <td colspan="2" style="
          height:5px;
          background:${headerConfig.topBarColor || "#84CC16"};
        "></td>
      </tr>`
      : ""
  }

<tr>
<td colspan="2" style="
  padding:0;
  background:#F3F4F6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

  <!-- HERO (FULL IMAGE) -->
  <div style="
    max-width:640px;
    margin:0 auto;
  ">
    <img 
      src="${heroImage}" 
      style="
        width:100%;
        height:auto;
        display:block;
      "
    />
  </div>

  <!-- CONTENT -->
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:22px 24px 16px 24px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="
          margin-bottom:10px;
          text-align:center;
        ">
          <img src="${logo}" style="
            max-width:105px;
            height:auto;
            opacity:0.9;
          " />
        </div>`
        : ""
    }

    ${
      headerConfig.subtitle
        ? `
        <div style="
          font-size:12px;
          letter-spacing:0.14em;
          text-transform:uppercase;
          color:#9CA3AF;
          margin-bottom:16px;
          text-align:center;
          font-weight:600;
        ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>`
        : ""
    }

    <!-- SPLIT TITLE / DATE -->
    <table width="100%" cellpadding="0" cellspacing="0" style="
      border-collapse:collapse;
    ">
      <tr>

        <!-- LEFT : TITLE -->
        <td style="
          text-align:left;
          vertical-align:top;
          padding-right:10px;
        ">
          ${
            headerConfig.title
              ? `
              <div style="
                font-size:22px;
                font-weight:700;
                color:#111827;
                line-height:1.3;
                letter-spacing:-0.01em;
              ">
                ${escapeHtml(headerConfig.title)}
              </div>
              `
              : ""
          }
        </td>

        <!-- RIGHT : DATE -->
        <td style="
          text-align:right;
          vertical-align:top;
          white-space:nowrap;
        ">
          ${
            headerConfig.period
              ? `
              <div style="
                font-size:14px;
                font-weight:600;
                color:${headerConfig.periodColor || "#84CC16"};
              ">
                ${escapeHtml(headerConfig.period)}
              </div>
              `
              : ""
          }
        </td>

      </tr>
    </table>

  </div>

</td>
</tr>
`;
}
