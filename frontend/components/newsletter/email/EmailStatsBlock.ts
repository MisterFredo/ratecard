type TopicStat = {
  label: string;
  count: number;
};

export function EmailStatsBlock(topicStats: TopicStat[]) {
  if (!topicStats.length) return "";

  const top = topicStats.slice(0, 12);

  const half = Math.ceil(top.length / 2);
  const left = top.slice(0, half);
  const right = top.slice(half);

  function renderColumn(items: TopicStat[]) {
    return items
      .map(
        (t) => `
        <tr>
          <td style="
              padding:4px 0;
              font-size:13px;
              color:#374151;
              font-family:Arial,Helvetica,sans-serif;
            ">
            ${t.label}
          </td>
          <td align="right" style="
              padding:4px 0;
              font-size:13px;
              font-weight:700;
              color:#111827;
              font-family:Arial,Helvetica,sans-serif;
            ">
            ${t.count}
          </td>
        </tr>
      `
      )
      .join("");
  }

  return `
<tr>
<td colspan="2" style="
    padding:28px 0;
    border-bottom:1px solid #E5E7EB;
    font-family:Arial,Helvetica,sans-serif;
  ">

  <div style="
      font-size:12px;
      font-weight:700;
      letter-spacing:0.06em;
      text-transform:uppercase;
      color:#6B7280;
      margin-bottom:16px;
    ">
    Baromètre des sujets — 30 derniers jours
  </div>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="50%" valign="top">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${renderColumn(left)}
        </table>
      </td>

      <td width="50%" valign="top" style="padding-left:24px;">
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
