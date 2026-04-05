export function EmailEditorialBlock(html: string) {
  if (!html) return "";

  return `
<tr>
<td style="
  padding:32px 28px;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- LABEL -->
  <div style="
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:0.14em;
    color:#9CA3AF;
    margin-bottom:14px;
    font-weight:600;
  ">
    Editorial
  </div>

  <!-- CONTENT -->
  <div style="
    font-size:16px;
    line-height:1.75;
    color:#111827;
    max-width:560px;
  ">
    ${html}
  </div>

</td>
</tr>
`;
}
