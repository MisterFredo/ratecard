import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

const GCS_BASE_URL =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

export function EmailHeader(
  headerConfig: HeaderConfig,
  introText?: string
) {
  const headerImage =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `${GCS_BASE_URL}/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `
<tr>
<td colspan="2" style="padding:32px 0 18px 0;">
  ${
    headerImage
      ? `<img src="${headerImage}" style="width:180px;height:auto;" />`
      : ""
  }
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
  headerConfig.subtitle
    ? `<tr>
<td colspan="2"
    style="font-size:14px;
           color:#6B7280;
           padding-bottom:16px;">
  ${escapeHtml(headerConfig.subtitle)}
</td>
</tr>`
    : ""
}

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
