export function EmailNumbersBlockGmail(
  numbers: NewsletterNumberItem[]
) {
  if (!numbers?.length) return "";

  return `
<tr>
<td style="
  padding:26px 16px 30px 16px;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td style="
        font-size:13px;
        font-weight:700;
        letter-spacing:0.08em;
        text-transform:uppercase;
        color:#111827;
        padding-bottom:14px;
      ">
        Chiffres clés
      </td>
    </tr>
  </table>

  <!-- LIST -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">

    ${numbers
      .map(
        (n, index) => `
      <tr>
        <td style="
          padding-bottom:${index === numbers.length - 1 ? "0" : "14px"};
          border-bottom:${index === numbers.length - 1 ? "none" : "1px solid #E5E7EB"};
        ">

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="
                font-size:18px;
                font-weight:700;
                color:#111827;
                padding-bottom:4px;
              ">
                ${formatValue(n)}
              </td>
            </tr>

            <tr>
              <td style="
                font-size:13px;
                color:#374151;
                line-height:1.4;
              ">
                ${escapeHtml(n.label)}
              </td>
            </tr>
          </table>

        </td>
      </tr>
      `
      )
      .join("")}

  </table>

</td>
</tr>
`;
}
