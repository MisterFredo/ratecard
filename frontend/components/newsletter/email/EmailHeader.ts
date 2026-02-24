import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

const GCS_BASE_URL =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

const LOGO_URL =
  `${GCS_BASE_URL}/brand/ratecard-logo.jpeg`;

export function EmailHeader(
  headerConfig: HeaderConfig,
  introText?: string
) {
  return `
<tr>
<td colspan="2" style="padding:32px 0 18px 0;">
  <img src="${LOGO_URL}" style="width:150px;height:auto;" />
</td>
</tr>

<tr>
<td colspan="2"
    style="font-size:22px;
           font-weight:700;
           color:#111827;
           padding-bottom:12px;">
  ${escapeHtml(headerConfig.title)}
</td>
</tr>

${
  introText
    ? `<tr>
<td colspan="2"
    style="font-size:15px;
           line-height:22px;
           color:#111827;
           padding-bottom:26px;">
${escapeHtml(introText).replace(/\n/g, "<br/>")}
</td>
</tr>`
    : ""
}
`;
}
