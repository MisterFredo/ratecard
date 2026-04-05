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

export function EmailNumbersBlockGmail(
  numbers: NewsletterNumberItem[]
) {
  if (!numbers?.length) return "";

  return `
<tr>
<td style="
  padding:22px 20px 20px 20px;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <div style="
    font-size:11px;
    font-weight:600;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:#9CA3AF;
    margin-bottom:10px;
  ">
    Chiffres clés
  </div>

  <!-- LIST -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

    ${numbers
      .map(
        (n) => `
<tr>
  <td style="padding:8px 0;">

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>

        <!-- VALUE -->
        <td valign="top" style="
          width:100px;
          font-size:18px;
          font-weight:700;
          color:#111827;
          letter-spacing:-0.01em;
          padding-right:8px;
        ">
          ${formatValue(n)}
        </td>

        <!-- TEXT -->
        <td valign="top">

          <div style="
            font-size:13px;
            color:#374151;
            line-height:1.4;
            font-weight:500;
          ">
            ${escapeHtml(n.label)}
          </div>

          ${
            n.entity
              ? `
              <div style="
                margin-top:3px;
                font-size:10px;
                color:#9CA3AF;
                text-transform:uppercase;
                letter-spacing:0.06em;
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
