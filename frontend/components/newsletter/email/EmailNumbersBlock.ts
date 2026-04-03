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

export function EmailNumbersBlock(numbers: NewsletterNumberItem[]) {
  return `
<tr>
<td style="
  padding-top:40px;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:13px;
    font-weight:700;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:#111827;
    margin-bottom:22px;
    padding-left:8px;
  ">
    Chiffres clés
  </div>
</td>
</tr>

<tr>
<td style="padding:0 8px 24px 8px;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${numbers
        .map(
          (n) => `
        <td style="width:50%; padding:8px; vertical-align:top;">
          <div style="
            border:1px solid #E5E7EB;
            border-radius:8px;
            padding:14px;
            background:#FFFFFF;
          ">
            <div style="
              font-size:20px;
              font-weight:700;
              color:#111827;
              margin-bottom:6px;
            ">
              ${formatValue(n)}
            </div>

            <div style="
              font-size:13px;
              color:#374151;
              line-height:1.4;
            ">
              ${n.label}
            </div>
          </div>
        </td>
      `
        )
        .join("")}

    </tr>
  </table>
</td>
</tr>
`;
}
