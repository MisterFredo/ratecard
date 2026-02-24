type TopicStat = {
  label: string;
  count: number;
};

export function EmailStatsBlock(topicStats: TopicStat[]) {
  if (!topicStats.length) return "";

  // On limite à 12 topics max
  const topTopics = topicStats.slice(0, 12);

  const rows = topTopics
    .map((t) => {
      return `
        <tr>
          <td style="
              padding:6px 0;
              font-size:13px;
              color:#374151;
              font-family:Arial,Helvetica,sans-serif;
            ">
            ${t.label}
          </td>

          <td align="right" style="
              padding:6px 0;
              font-size:13px;
              font-weight:700;
              color:#111827;
              font-family:Arial,Helvetica,sans-serif;
            ">
            ${t.count}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<tr>
  <td colspan="2" style="
      padding:28px 0 28px 0;
      border-bottom:1px solid #E5E7EB;
      font-family:Arial,Helvetica,sans-serif;
    ">

    <!-- Title -->
    <div style="
        font-size:12px;
        font-weight:700;
        letter-spacing:0.04em;
        text-transform:uppercase;
        color:#6B7280;
        margin-bottom:14px;
      ">
      Baromètre des sujets — 30 derniers jours
    </div>

    <!-- Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="
        border-collapse:collapse;
      ">
      ${rows}
    </table>

  </td>
</tr>
`;
}
