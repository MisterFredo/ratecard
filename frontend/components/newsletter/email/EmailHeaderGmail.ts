import type { HeaderConfig } from "@/types/newsletter";

export function EmailHeaderGmail(
  headerConfig: HeaderConfig
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `
<!-- TOP SIGNATURE BAR -->
<tr>
  <td style="
      height:6px;
      background:#84CC16;
      line-height:6px;
      font-size:0;
    ">
    &nbsp;
  </td>
</tr>

<tr>
  <td style="
      padding:48px 32px 42px 32px;
      background:#FFFFFF;
      border-bottom:1px solid #E5E7EB;
      font-family:Arial,Helvetica,sans-serif;
      text-align:center;
    ">

    ${
      logo
        ? `
        <div style="margin-bottom:28px;">
          <img 
            src="${logo}"
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
            letter-spacing:0.18em;
            text-transform:uppercase;
            color:#6B7280;
            margin-bottom:16px;
            font-weight:600;
          ">
          ${headerConfig.subtitle}
        </div>
        `
        : ""
    }

    ${
      headerConfig.title
        ? `
        <div style="
            font-size:30px;
            font-weight:700;
            color:#111827;
            line-height:1.2;
            margin-bottom:${
              headerConfig.period ? "12px" : "18px"
            };
            max-width:640px;
            margin-left:auto;
            margin-right:auto;
          ">
          ${headerConfig.title}
        </div>
        `
        : ""
    }

    ${
      headerConfig.period
        ? `
        <div style="
            font-size:20px;
            font-weight:700;
            color:#84CC16;
            line-height:1.3;
            margin-bottom:8px;
          ">
          ${headerConfig.period}
        </div>
        `
        : ""
    }

  </td>
</tr>
`;
}
