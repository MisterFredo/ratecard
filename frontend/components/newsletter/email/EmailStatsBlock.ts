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
      padding:10px 0;
      font-size:16px;
      font-family:Arial,Helvetica,sans-serif;
      line-height:1.7;
      color:#0F172A;
    ">
    <span style="font-weight:600;">
      ${t.label}
    </span>
    <span style="
        font-weight:600;
        margin-left:6px;
      ">
      ${t.last_30_days}
    </span>
    <span style="
        color:#94A3B8;
        font-weight:400;
        margin-left:6px;
        font-size:14px;
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
    padding:56px 0 48px 0;
    border-top:1px solid #F1F5F9;
    border-bottom:1px solid #F1F5F9;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <!-- TITLE -->
  <div style="
      font-size:12px;
      font-weight:700;
      letter-spacing:0.18em;
      text-transform:uppercase;
      color:#94A3B8;
      margin-bottom:10px;
    ">
    Baromètre
  </div>

  <div style="
      font-size:20px;
      font-weight:700;
      color:#0F172A;
      margin-bottom:28px;
    ">
    Les sujets les plus actifs — 30 derniers jours
  </div>

  <!-- COLUMNS -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      <td
        valign="top"
        class="stack-column"
        style="
          width:50%;
          padding-right:28px;
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
