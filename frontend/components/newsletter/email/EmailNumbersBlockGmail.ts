import type { NewsletterNumberItem } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

/* =========================================================
   FORMAT VALUE
========================================================= */

function formatValue(n: NewsletterNumberItem) {
  if (n.value === undefined || n.value === null) return "";

  const scaleMap: any = {
    thousand: "K",
    million: "M",
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[n.scale || ""] || "";
  const unit = n.unit || "";

  return [n.value, scale, unit]
    .filter(Boolean)
    .join(" ");
}

/* =========================================================
   BLOCK
========================================================= */

export function EmailNumbersBlockGmail(
  numbers: NewsletterNumberItem[]
) {
  if (!numbers?.length) return "";

  return `
<tr>
<td style="
  padding:36px 20px 36px 20px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
        font-size:12px;
        font-weight:600;
        letter-spacing:0.14em;
        text-transform:uppercase;
        color:#6B7280;
        padding-bottom:18px;
      ">
        Chiffres clés
      </td>
    </tr>
  </table>

  <!-- LIST -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

    ${numbers
      .map(
        (n, index) => `
<tr>
  <td style="
    padding:${index === numbers.length - 1 ? "14px 0 0 0" : "14px 0"};
    border-bottom:${index === numbers.length - 1 ? "none" : "1px solid #F1F5F9"};
  ">

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>

        <!-- VALUE -->
        <td valign="top" style="
          width:120px;
          font-size:22px;
          font-weight:700;
          color:#111827;
          letter-spacing:-0.02em;
          padding-right:10px;
        ">
          ${formatValue(n)}
        </td>

        <!-- TEXT -->
        <td valign="top">

          <!-- LABEL -->
          <div style="
            font-size:14px;
            color:#374151;
            line-height:1.5;
            font-weight:500;
          ">
            ${escapeHtml(n.label)}
          </div>

          ${
            n.entity
              ? `
              <!-- ENTITY -->
              <div style="
                margin-top:6px;
                font-size:11px;
                color:#9CA3AF;
                text-transform:uppercase;
                letter-spacing:0.08em;
              ">
                ${escapeHtml(n.entity.label)}
              </div>
              `
              : ""
          }

        </td>

      </tr>
    </table>

  </td>
</tr>
`
      )
      .join("")}

  </table>

</td>
</tr>
`;
}
