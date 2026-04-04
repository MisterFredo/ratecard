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

  <!-- HERO IMAGE -->
  <div style="
    max-width:640px;
    margin:0 auto;
    overflow:hidden;
    background:#000;
  ">
    <img 
      src="${heroImage}" 
      style="
        width:100%;
        height:220px;
        object-fit:cover;
        display:block;
      "
    />
  </div>

  <!-- CONTENT -->
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:28px 24px 26px 24px;
    border-bottom:1px solid #E5E7EB;
  ">

    ${
      logo
        ? `
        <div style="
          margin-bottom:18px;
          text-align:center;
        ">
          <img src="${logo}" style="
            display:inline-block;
            max-width:110px;
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
          letter-spacing:0.16em;
          text-transform:uppercase;
          color:#9CA3AF;
          margin-bottom:10px;
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
          font-size:24px;
          font-weight:700;
          color:#111827;
          line-height:1.3;
          margin-bottom:8px;
          text-align:center;
          letter-spacing:-0.01em;
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
          text-align:center;
        ">
          ${escapeHtml(headerConfig.period)}
        </div>

        <div style="
          width:24px;
          height:2px;
          background:${headerConfig.periodColor || "#84CC16"};
          margin:10px auto 18px auto;
          opacity:0.6;
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
