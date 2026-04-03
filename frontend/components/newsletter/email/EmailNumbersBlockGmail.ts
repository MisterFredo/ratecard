import type { NewsletterNumberItem } from "@/types/newsletter";

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

export function EmailNumbersBlockGmail(numbers: NewsletterNumberItem[]) {
  return `
<tr>
<td style="padding-top:24px; font-family:Arial,Helvetica,sans-serif;">

  <div style="
    font-size:14px;
    font-weight:bold;
    margin-bottom:12px;
  ">
    Chiffres clés
  </div>

  ${numbers
    .map(
      (n) => `
    <div style="
      margin-bottom:12px;
      padding-bottom:12px;
      border-bottom:1px solid #E5E7EB;
    ">
      <div style="
        font-size:18px;
        font-weight:bold;
      ">
        ${formatValue(n)}
      </div>

      <div style="
        font-size:13px;
        color:#444;
      ">
        ${n.label}
      </div>
    </div>
  `
    )
    .join("")}

</td>
</tr>
`;
}
