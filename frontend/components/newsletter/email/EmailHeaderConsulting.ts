import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

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
  padding:32px 32px 28px 32px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
">

  <!-- HEADER LINE (STRUCTURANT) -->
  <table width="100%" role="presentation" style="margin-bottom:18px;">
    <tr>
      <td align="left">
        ${
          logo
            ? `<img src="${logo}" style="max-height:26px;" />`
            : `<span style="font-weight:600;">Ratecard</span>`
        }
      </td>
      <td align="right" style="
        font-size:12px;
        color:#6B7280;
      ">
        ${escapeHtml(headerConfig.period || "")}
      </td>
    </tr>
  </table>

  <!-- TITLE -->
  ${
    headerConfig.title
      ? `
      <div style="
        font-size:26px;
        font-weight:700;
        color:#111827;
        line-height:1.3;
        margin-bottom:10px;
        max-width:620px;
      ">
        ${escapeHtml(headerConfig.title)}
      </div>`
      : ""
  }

  <!-- SUBTITLE -->
  ${
    headerConfig.subtitle
      ? `
      <div style="
        font-size:14px;
        color:#4B5563;
        margin-bottom:18px;
        max-width:620px;
      ">
        ${escapeHtml(headerConfig.subtitle)}
      </div>`
      : ""
  }

  <!-- DIVIDER -->
  <div style="
    height:1px;
    background:#E5E7EB;
    margin:18px 0;
  "></div>

  <!-- INTRO -->
  ${
    introHtml
      ? `
      <div style="
        font-size:15px;
        color:#374151;
        line-height:1.65;
        max-width:620px;
      ">
        ${introHtml}
      </div>`
      : ""
  }

</td>
</tr>
`;
}
