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
  padding:36px 32px 30px 32px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
">

  <!-- LOGO -->
  ${
    logo
      ? `
      <div style="margin-bottom:20px;">
        <img 
          src="${logo}" 
          width="130"
          style="display:block;height:auto;"
        />
      </div>`
      : ""
  }

  <!-- SUBTITLE -->
  ${
    headerConfig.subtitle
      ? `
      <div style="
        font-size:10px;
        letter-spacing:0.16em;
        text-transform:uppercase;
        color:#6B7280;
        margin-bottom:12px;
        font-weight:600;
      ">
        ${headerConfig.subtitle}
      </div>`
      : ""
  }

  <!-- TITLE -->
  ${
    headerConfig.title
      ? `
      <div style="
        font-size:28px;
        font-weight:700;
        color:#111827;
        line-height:1.25;
        margin-bottom:${headerConfig.period ? "12px" : "16px"};
        max-width:640px;
      ">
        ${headerConfig.title}
      </div>`
      : ""
  }

  <!-- PERIOD -->
  ${
    headerConfig.period
      ? `
      <div style="
        font-size:13px;
        font-weight:500;
        color:${headerConfig.periodColor || "#6B7280"};
        margin-bottom:18px;
      ">
        ${headerConfig.period}
      </div>`
      : ""
  }

  <!-- SEPARATOR (🔥 CONSULTING TOUCH) -->
  <div style="
    width:40px;
    height:2px;
    background:#111827;
    margin-bottom:18px;
  "></div>

  <!-- INTRO -->
  ${
    introHtml
      ? `
      <div style="
        font-size:15px;
        color:#374151;
        line-height:1.65;
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
