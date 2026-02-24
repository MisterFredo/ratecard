import type { TopicStat } from "@/types/newsletter";

export function EmailStatsBlock(topicStats: TopicStat[]) {
  if (!topicStats?.length) return "";

  const half = Math.ceil(topicStats.length / 2);
  const left = topicStats.slice(0, half);
  const right = topicStats.slice(half);

  function renderColumn(items: TopicStat[]) {
    return items
      .map(
        (t) => `
<tr>
  <td style="
      padding:6px 0;
      font-size:15px;
      font-family:Arial,Helvetica,sans-serif;
      line-height:1.6;
      color:#111827;
    ">
    <span style="font-weight:600;">
      ${t.label}
    </span>
    : ${t.last_30_days}
    <span style="
        color:#6B7280;
        font-weight:400;
      ">
      (${t.total})
    </span>
  </td>
</tr>
`
      )
      .join("");
  }

  return `
<tr>
<td style="
    padding:42px 0 38px 0;
    border-top:1px solid #E5E7EB;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <!-- TITLE -->
  <div style="
      font-size:13px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      color:#111827;
      margin-bottom:20px;
    ">
    Baromètre des sujets — 
    <span style="
        font-weight:400;
        text-transform:none;
        color:#6B7280;
      ">
      30 derniers jours
    </span>
  </div>

  <!-- COLUMNS -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      <td
        valign="top"
        class="stack-column"
        style="
          width:50%;
          padding-right:24px;
          vertical-align:top;
        "
      >
        <table width="100%" cellpadding="0" cellspacing="0">
          ${renderColumn(left)}
        </table>
      </td>

      <td
        valign="top"
        class="stack-column"
        style="
          width:50%;
          vertical-align:top;
        "
      >
        <table width="100%" cellpadding="0" cellspacing="0">
          ${renderColumn(right)}
        </table>
      </td>

    </tr>
  </table>

</td>
</tr>
`;
}
