export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   IMAGE HELPER (ajouté)
============================================================ */

const GCS_BASE =
  process.env.NEXT_PUBLIC_GCS_BASE_URL ||
  "https://storage.googleapis.com/ratecard-media";

export function buildContentImageUrl(
  visualRectId?: string | null
) {
  if (!visualRectId) return null;
  return `${GCS_BASE}/news/${visualRectId}`;
}

export function renderEmailTags({
  topics = [],
  companies = [],
  styles = [],
}: {
  topics?: any[];
  companies?: any[];
  styles?: string[];
}) {
  const render = (label: string, bg: string, color: string) => `
    <span style="
      display:inline-block;
      font-size:11px;
      padding:4px 8px;
      margin-right:6px;
      margin-top:6px;
      background:${bg};
      color:${color};
      border-radius:12px;
      font-weight:500;
    ">
      ${label}
    </span>
  `;

  const topicTags =
    topics?.map((t: any) =>
      render(t.label, "#F3F4F6", "#374151")
    ) || [];

  const companyTags =
    companies?.map((c: any) =>
      render(c.name, "#EEF2FF", "#3730A3")
    ) || [];

  const styleTags =
    styles?.map((s: string) =>
      render(s, "#111827", "#FFFFFF")
    ) || [];

  return [...styleTags, ...companyTags, ...topicTags].join("");
}
