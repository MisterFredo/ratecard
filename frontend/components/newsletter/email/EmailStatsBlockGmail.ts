import type { TopicStat } from "@/types/newsletter";

export function EmailStatsBlockGmail(
  topicStats: TopicStat[]
) {
  if (!topicStats?.length) return "";

  const rows = topicStats
    .map(
      (t) => `
<tr>
  <td style="
      padding-bottom:6px;
      font-size:15px;
      line-height:1.6;
      font-family:Arial,Helvetica,sans-serif;
    ">
    <span style="font-weight:600;">
      ${t.label}
    </span>
    : ${t.last_30_days}
    <span style="color:#6B7280;">
      (${t.total})
    </span>
  </td>
</tr>
`
    )
    .join("");

  return `
<tr>
<td style="
    padding:32px 16px 40px 16px;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

    <tr>
      <td style="
          font-size:14px;
          font-weight:600;
          margin-bottom:12px;
          color:#111827;
          padding-bottom:12px;
        ">
        Baromètre — 30 derniers jours
      </td>
    </tr>

    ${rows}

  </table>

</td>
</tr>
`;
}
