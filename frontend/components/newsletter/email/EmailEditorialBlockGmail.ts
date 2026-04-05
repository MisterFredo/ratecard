export function EmailEditorialBlockGmail(html: string) {
  if (!html) return "";

  return `
<tr>
<td style="
  padding:24px 0;
  font-family:Arial,Helvetica,sans-serif;
">

  <!-- LABEL -->
  <div style="
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:0.14em;
    color:#9CA3AF;
    margin-bottom:10px;
    font-weight:600;
  ">
    Editorial
  </div>

  <!-- CONTENT -->
  <div style="
    font-size:15px;
    line-height:1.65;
    color:#111827;
    max-width:560px;
  ">
    ${html}
  </div>

</td>
</tr>

<!-- SEPARATOR -->
<tr>
  <td style="
    height:1px;
    background:#F3F4F6;
    font-size:0;
    line-height:0;
  ">&nbsp;</td>
</tr>

<!-- SPACER (GMAIL SAFE) -->
<tr>
  <td height="8" style="font-size:0; line-height:0;">&nbsp;</td>
</tr>
`;
}
