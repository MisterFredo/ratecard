import type {
  DigestContentItem,
} from "@/types/digest";

import {
  escapeHtml,
  formatDate,
} from "@/components/delivery/email/EmailHelpers";

/* ========================================================= */

const GCS_BASE_URL =
  process.env
    .NEXT_PUBLIC_GCS_BASE_URL || "";

/* ========================================================= */

function renderBadges(
  items: any[],
  field: string,
  color: string,
) {

  if (!items?.length) {
    return "";
  }

  return items
    .slice(0, 6)
    .map((item) => {

      const label =
        item?.label ||
        item?.name ||
        "";

      if (!label) {
        return "";
      }

      return `
<span style="
  display:inline-block;
  padding:4px 8px;
  margin-right:6px;
  margin-bottom:6px;
  border-radius:999px;
  background:${color};
  font-size:11px;
  line-height:1;
  color:white;
  font-weight:600;
">
  ${escapeHtml(label)}
</span>
`;
    })
    .join("");
}

/* ========================================================= */

export function EmailContentBlock(
  contents: DigestContentItem[]
) {

  if (!contents.length) {
    return "";
  }

  return `
<tr>
<td style="padding-top:28px;">

  <div style="
    font-size:11px;
    font-weight:600;
    letter-spacing:0.14em;
    text-transform:uppercase;
    color:#9CA3AF;
    margin-bottom:14px;
    font-family:Arial,Helvetica,sans-serif;
  ">
    Contenus
  </div>

</td>
</tr>

${contents.map((content) => {

  const logoUrl =
    content.primary_company_logo
      ? `${GCS_BASE_URL}/${content.primary_company_logo}`
      : null;

  return `
<tr>
<td style="
  padding:20px 0;
  border-bottom:1px solid #F3F4F6;
  font-family:Arial,Helvetica,sans-serif;
">

  ${
    logoUrl
      ? `
<div style="margin-bottom:14px;">
  <img
    src="${logoUrl}"
    alt=""
    style="
      max-height:28px;
      max-width:140px;
      display:block;
    "
  />
</div>
`
      : ""
  }

  <div style="
    font-size:18px;
    font-weight:700;
    line-height:1.3;
    color:#111827;
    margin-bottom:6px;
  ">
    <a
      href="${content.url || "#"}"
      target="_blank"
      style="
        color:#111827;
        text-decoration:none;
      "
    >
      ${escapeHtml(content.title)}
    </a>
  </div>

  ${
    content.published_at
      ? `
<div style="
  font-size:12px;
  color:#9CA3AF;
  margin-bottom:10px;
">
  ${formatDate(content.published_at)}
</div>
`
      : ""
  }

  ${
    content.excerpt
      ? `
<div style="
  font-size:14px;
  line-height:1.6;
  color:#374151;
  margin-bottom:14px;
">
  ${escapeHtml(content.excerpt)}
</div>
`
      : ""
  }

  <div style="margin-bottom:6px;">

    ${renderBadges(
      content.companies,
      "companies",
      "#111827"
    )}

    ${renderBadges(
      content.topics,
      "topics",
      "#2563EB"
    )}

    ${renderBadges(
      content.universes,
      "universes",
      "#059669"
    )}

    ${renderBadges(
      content.concepts,
      "concepts",
      "#7C3AED"
    )}

  </div>

</td>
</tr>
`;
}).join("")}
`;
}
