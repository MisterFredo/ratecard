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

  const rows = numbers
    .map((n, index) => `
<tr>
<td style="
  padding:16px 0;
  border-bottom:${index === numbers.length - 1 ? "none" : "1px solid #F3F4F6"};
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- VALUE -->
  <div style="
    font-size:18px;
    font-weight:700;
    color:#111827;
    line-height:1.2;
    margin-bottom:4px;
  ">
    ${formatValue(n)}
  </div>

  <!-- LABEL -->
  <div style="
    font-size:14px;
    color:#374151;
    line-height:1.4;
  ">
    ${escapeHtml(n.label)}
  </div>

  ${
    n.entity
      ? `
  <!-- ENTITY -->
  <div style="
    margin-top:4px;
    font-size:11px;
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
`)
    .join("");

  return `
<tr>
<td style="
  padding-top:28px;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:11px;
    font-weight:600;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:#9CA3AF;
    margin-bottom:10px;
  ">
    Chiffres clés
  </div>
</td>
</tr>

${rows}
`;
}
