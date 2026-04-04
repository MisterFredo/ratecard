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

  <!-- HERO (NO CROP) -->
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
    padding:22px 24px 18px 24px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="
          margin-bottom:12px;
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
          margin-bottom:14px;
          text-align:center;
          font-weight:600;
        ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>`
        : ""
    }

    <!-- TITLE + DATE INLINE -->
    <div style="
      text-align:center;
      margin-bottom:6px;
    ">
      
      ${
        headerConfig.title
          ? `
          <span style="
            font-size:22px;
            font-weight:700;
            color:#111827;
            letter-spacing:-0.01em;
          ">
            ${escapeHtml(headerConfig.title)}
          </span>
          `
          : ""
      }

      ${
        headerConfig.period
          ? `
          <span style="
            font-size:14px;
            font-weight:600;
            color:${headerConfig.periodColor || "#84CC16"};
            margin-left:10px;
          ">
            — ${escapeHtml(headerConfig.period)}
          </span>
          `
          : ""
      }

    </div>

  </div>

</td>
</tr>
`;
}
