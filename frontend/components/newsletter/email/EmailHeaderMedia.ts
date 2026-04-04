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
          height:6px;
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

  <!-- HERO IMAGE -->
  <div style="
    max-width:640px;
    margin:0 auto;
    overflow:hidden;
  ">
    <img 
      src="${heroImage}" 
      style="
        width:100%;
        height:auto;
        display:block;
        border-bottom:1px solid #E5E7EB;
      "
    />
  </div>

  <!-- CONTAINER -->
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:40px 28px 36px 28px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="
          margin-bottom:24px;
          text-align:center;
        ">
          
          <div style="
            display:inline-block;
            padding:10px 18px;
            background:#FFFFFF;
            border:1px solid #E5E7EB;
            border-radius:8px;
          ">
            <img src="${logo}" style="
              display:block;
              max-width:130px;
              max-height:36px;
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
          font-size:12px;
          letter-spacing:0.18em;
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

    ${
      headerConfig.title
        ? `
        <div style="
          font-size:30px;
          font-weight:800;
          color:#111827;
          line-height:1.25;
          margin-bottom:12px;
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
          font-size:16px;
          font-weight:700;
          color:${headerConfig.periodColor || "#84CC16"};
          margin-bottom:16px;
          text-align:center;
        ">
          ${escapeHtml(headerConfig.period)}
        </div>

        <!-- ACCENT LINE -->
        <div style="
          width:32px;
          height:2px;
          background:${headerConfig.periodColor || "#84CC16"};
          margin:14px auto 22px auto;
          border-radius:2px;
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
          line-height:1.7;
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
