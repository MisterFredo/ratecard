import type { TopicStat } from "@/types/newsletter";

export function EmailStatsBlockGmail(
  topicStats: TopicStat[]
) {
  if (!topicStats?.length) return "";

  const rows = topicStats
    .map(
      (t) => `
        <div style="
            margin-bottom:6px;
            font-size:15px;
            line-height:1.6;
          ">
          <span style="font-weight:600;">
            ${t.label}
          </span>
          : ${t.last_30_days}
          <span style="color:#6B7280;">
            (${t.total})
          </span>
        </div>
      `
    )
    .join("");

  return `
<div style="
    margin:32px 0 40px 0;
  ">

  <div style="
      font-size:14px;
      font-weight:600;
      margin-bottom:12px;
      color:#111827;
    ">
    Baromètre — 30 derniers jours
  </div>

  ${rows}

</div>
`;
}
