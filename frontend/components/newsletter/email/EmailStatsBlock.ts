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
      padding:8px 0;
      font-size:15px;
      font-family:Arial,Helvetica,sans-serif;
      line-height:1.6;
      color:#1F2937;
    ">
    <span style="font-weight:500;">
      ${t.label}
    </span>
    <span style="
        font-weight:600;
        margin-left:6px;
      ">
      ${t.last_30_days}
    </span>
    <span style="
        color:#9CA3AF;
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
    padding:40px 0;
    border-top:1px solid #F1F5F9;
    border-bottom:1px solid #F1F5F9;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
          background:#F8FAFC;
          padding:26px 24px;
          border-radius:8px;
        ">

        <!-- LABEL -->
        <div style="
            font-size:11px;
            font-weight:600;
            letter-spacing:0.16em;
            text-transform:uppercase;
            color:#94A3B8;
            margin-bottom:8px;
          ">
          Baromètre
        </div>

        <!-- TITLE -->
        <div style="
            font-size:18px;
            font-weight:600;
            color:#111827;
            margin-bottom:20px;
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
                padding-right:20px;
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
  </table>

</td>
</tr>
`;
}
