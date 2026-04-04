import type { HeaderConfig } from "@/types/newsletter";

export function EmailHeaderConsulting(
  headerConfig: HeaderConfig,
  introHtml?: string
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
          background:${headerConfig.topBarColor || "#111827"};
        "></td>
      </tr>`
      : ""
  }

<tr>
<td colspan="2" style="
  padding:40px 32px 28px 32px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
">

  ${
    logo
      ? `
      <div style="margin-bottom:18px;">
        <img src="${logo}" width="140" />
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
        margin-bottom:10px;
        font-weight:600;
      ">
        ${headerConfig.subtitle}
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
        line-height:1.3;
        margin-bottom:10px;
        max-width:640px;
      ">
        ${headerConfig.title}
      </div>`
      : ""
  }

  ${
    headerConfig.period
      ? `
      <div style="
        font-size:13px;
        color:${headerConfig.periodColor || "#6B7280"};
        margin-bottom:14px;
      ">
        ${headerConfig.period}
      </div>`
      : ""
  }

  ${
    introHtml
      ? `
      <div style="
        font-size:15px;
        color:#374151;
        line-height:1.6;
        max-width:640px;
      ">
        ${introHtml}
      </div>`
      : ""
  }

</td>
</tr>
`;
}
