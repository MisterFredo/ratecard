export function EmailNumbersBlock(numbers: NewsletterNumberItem[]) {
  if (!numbers.length) return "";

  const rows = [];
  for (let i = 0; i < numbers.length; i += 2) {
    rows.push(numbers.slice(i, i + 2));
  }

  return `
<!-- =========================
    NUMBERS BLOCK
========================= -->
<tr>
<td style="
  padding:28px 20px 6px 20px;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <div style="
    font-size:11px;
    font-weight:600;
    letter-spacing:0.12em;
    text-transform:uppercase;
    color:#9CA3AF;
    margin-bottom:14px;
  ">
    Chiffres clés
  </div>

</td>
</tr>

${rows
  .map(
    (pair) => `
<tr>
<td style="padding:0 14px 2px 14px;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${pair
        .map(
          (n) => `
<td width="50%" valign="top" style="padding:6px;">

  <!-- CARD -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
        background:#FFFFFF;
      ">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="
              padding:12px 12px 10px 12px;
            ">

              <!-- VALUE -->
              <div style="
                font-size:22px;
                font-weight:700;
                color:#111827;
                letter-spacing:-0.01em;
                line-height:1.2;
                margin-bottom:4px;
              ">
                ${formatValue(n)}
              </div>

              <!-- LABEL -->
              <div style="
                font-size:13px;
                color:#4B5563;
                line-height:1.4;
                font-weight:500;
              ">
                ${escapeHtml(n.label)}
              </div>

              ${
                n.entity
                  ? `
                  <div style="
                    margin-top:6px;
                    font-size:10px;
                    color:#9CA3AF;
                    text-transform:uppercase;
                    letter-spacing:0.06em;
                  ">
                    ${escapeHtml(n.entity.label)}
                  </div>
                  `
                  : ""
              }

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</td>
`
        )
        .join("")}

      ${pair.length === 1 ? `<td width="50%"></td>` : ""}

    </tr>
  </table>

</td>
</tr>
`
  )
  .join("")}
`;
}
