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

const BADGE_STYLES = {

  company: {
    bg: "#EFF6FF",
    text: "#2563EB",
    border: "#DBEAFE",
  },

  solution: {
    bg: "#FAF5FF",
    text: "#9333EA",
    border: "#E9D5FF",
  },

  universe: {
    bg: "#ECFDF5",
    text: "#059669",
    border: "#D1FAE5",
  },

  topic: {
    bg: "#F3F4F6",
    text: "#4B5563",
    border: "#F3F4F6",
  },

  concept: {
    bg: "#FAF5FF",
    text: "#7C3AED",
    border: "#E9D5FF",
  },
};

/* ========================================================= */

function renderBadges(
  items: any[],
  type:
    | "company"
    | "solution"
    | "universe"
    | "topic"
    | "concept",
) {

  if (!items?.length) {
    return "";
  }

  const style =
    BADGE_STYLES[type];

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
  padding:5px 10px;
  margin-right:6px;
  margin-bottom:6px;
  border-radius:999px;
  background:${style.bg};
  color:${style.text};
  border:1px solid ${style.border};
  font-size:11px;
  line-height:1;
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
      "company"
    )}

    ${renderBadges(
      content.solutions,
      "solution"
    )}

    ${renderBadges(
      content.topics,
      "topic"
    )}

    ${renderBadges(
      content.universes,
      "universe"
    )}

    ${renderBadges(
      content.concepts,
      "concept"
    )}

  </div>

</td>
</tr>
`;
}).join("")}
`;
}
