export function EmailNumbersBlock(numbers: NewsletterNumberItem[]) {
  if (!numbers.length) return "";

  const rows = [];
  for (let i = 0; i < numbers.length; i += 2) {
    rows.push(numbers.slice(i, i + 2));
  }

  return `
<tr>
<td style="
  padding-top:40px;
  font-family:Arial,Helvetica,sans-serif;
">
  <div style="
    font-size:13px;
    font-weight:700;
    letter-spacing:0.08em;
    text-transform:uppercase;
    color:#111827;
    margin-bottom:22px;
    padding-left:8px;
  ">
    Chiffres clés
  </div>
</td>
</tr>

${rows
  .map(
    (pair) => `
<tr>
<td style="padding:0 8px;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>

      ${pair
        .map(
          (n) => `
<td width="50%" valign="top" style="width:50%; padding:8px;">
  
  <!-- CARD -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
        border:1px solid #E5E7EB;
        background:#FFFFFF;
      ">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:14px;">

              <!-- VALUE -->
              <div style="
                font-size:20px;
                font-weight:700;
                color:#111827;
                margin-bottom:6px;
              ">
                ${formatValue(n)}
              </div>

              <!-- LABEL -->
              <div style="
                font-size:13px;
                color:#374151;
                line-height:1.4;
              ">
                ${escapeHtml(n.label)}
              </div>

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

      ${
        pair.length === 1
          ? `<td width="50%" style="width:50%;"></td>`
          : ""
      }

    </tr>
  </table>
</td>
</tr>
`
  )
  .join("")}
`;
}
