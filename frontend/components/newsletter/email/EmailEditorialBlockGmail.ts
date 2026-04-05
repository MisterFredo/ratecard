export function EmailEditorialBlockGmail(html: string) {
  if (!html) return "";

  return `
<tr>
<td style="
  padding:28px 24px 22px 24px;
  background:#FFFFFF;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- TITLE -->
  <div style="
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:0.16em;
    color:#9CA3AF;
    margin-bottom:12px;
    font-weight:600;
  ">
    Editorial
  </div>

  <!-- CONTENT -->
  <div style="
    font-size:16px;
    line-height:1.7;
    color:#111827;
    max-width:560px;
  ">
    ${html}
  </div>

</td>
</tr>

<!-- SEPARATOR (subtle) -->
<tr>
  <td style="
    height:1px;
    background:#F3F4F6;
    font-size:0;
    line-height:0;
  ">&nbsp;</td>
</tr>

<!-- SPACER (important Gmail) -->
<tr>
  <td height="10" style="font-size:0; line-height:0;">&nbsp;</td>
</tr>
`;
}
