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

export function EmailNumbersBlock(numbers: NewsletterNumberItem[]) {
  if (!numbers.length) return "";

  const rows = [];
  for (let i = 0; i < numbers.length; i += 2) {
    rows.push(numbers.slice(i, i + 2));
  }

  return `
<!-- =========================
    NUMBERS BLOCK
========================= -->
<tr>
<td style="
  padding:52px 24px 12px 24px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <div style="
    font-size:12px;
    font-weight:600;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:#6B7280;
    margin-bottom:26px;
  ">
    Chiffres clés
  </div>

</td>
</tr>

${rows
  .map(
    (pair) => `
<tr>
<td style="padding:0 16px 6px 16px;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${pair
        .map(
          (n) => `
<td width="50%" valign="top" style="padding:10px;">

  <!-- CARD -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
        background:#FFFFFF;
        border:1px solid #F1F5F9;
      ">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="
              padding:20px 18px 18px 18px;
            ">

              <!-- VALUE -->
              <div style="
                font-size:28px;
                font-weight:700;
                color:#111827;
                letter-spacing:-0.02em;
                line-height:1.1;
                margin-bottom:8px;
              ">
                ${formatValue(n)}
              </div>

              <!-- LABEL -->
              <div style="
                font-size:14px;
                color:#4B5563;
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
                    margin-top:10px;
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
  </table>

</td>
`
        )
        .join("")}

      ${
        pair.length === 1
          ? `<td width="50%"></td>`
          : ""
      }

    </tr>
  </table>

</td>
</tr>
`
  )
  .join("")}
`;
}
