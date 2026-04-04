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

  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:28px 28px 24px 28px;
    border-bottom:1px solid #E5E7EB;
  ">

    <!-- SIGNATURE RATECARD -->
    <div style="
      text-align:center;
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      color:#111827;
      margin-bottom:14px;
    ">
      RATECARD
    </div>

    ${
      headerConfig.subtitle
        ? `
        <div style="
          font-size:10px;
          letter-spacing:0.18em;
          text-transform:uppercase;
          color:#9CA3AF;
          text-align:center;
          margin-bottom:8px;
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
          text-align:center;
          margin-bottom:12px;
        ">
          ${escapeHtml(headerConfig.title)}
        </div>`
        : ""
    }

    ${
      headerConfig.period
        ? `
        <div style="text-align:center; margin-bottom:14px;">

          <span style="
            display:inline-block;
            font-size:12px;
            font-weight:600;
            color:#111827;
            background:#F3F4F6;
            padding:6px 12px;
            border-radius:999px;
          ">
            ${escapeHtml(headerConfig.period)}
          </span>

        </div>`
        : ""
    }

    ${
      introText
        ? `
        <div style="
          font-size:14px;
          color:#4B5563;
          max-width:520px;
          margin:0 auto;
          line-height:1.6;
          text-align:left;
        ">
          ${escapeHtml(introText).replace(/\n/g, "<br/>")}
        </div>`
        : ""
    }

    ${
      logo
        ? `
        <div style="
          margin-top:18px;
          text-align:center;
          opacity:0.7;
        ">
          <img src="${logo}" style="
            max-width:100px;
            max-height:28px;
            display:inline-block;
          " />
        </div>`
        : ""
    }

  </div>

</td>
</tr>
`;
}
