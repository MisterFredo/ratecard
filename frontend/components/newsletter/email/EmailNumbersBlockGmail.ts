import type { NewsletterNumberItem } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

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
  padding:26px 16px 30px 16px;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <div style="
    font-size:13px;
    font-weight:700;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:#111827;
    margin-bottom:14px;
  ">
    Chiffres clés
  </div>

  ${numbers
    .map(
      (n, index) => `
    <div style="
      margin-bottom:${index === numbers.length - 1 ? "0" : "14px"};
      padding-bottom:${index === numbers.length - 1 ? "0" : "14px"};
      border-bottom:${index === numbers.length - 1 ? "none" : "1px solid #E5E7EB"};
    ">

      <div style="
        font-size:18px;
        font-weight:700;
        color:#111827;
        margin-bottom:4px;
      ">
        ${formatValue(n)}
      </div>

      <div style="
        font-size:13px;
        color:#374151;
        line-height:1.4;
      ">
        ${escapeHtml(n.label)}
      </div>

    </div>
  `
    )
    .join("")}

</td>
</tr>
`;
}
