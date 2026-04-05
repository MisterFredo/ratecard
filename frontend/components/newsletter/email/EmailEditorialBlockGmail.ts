export function EmailEditorialBlockGmail(html: string) {
  return `
<tr>
<td style="
  padding:16px 20px 18px 20px;
  background:#FFFFFF;
">

  <!-- TITLE -->
  <div style="
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:0.14em;
    color:#9CA3AF;
    margin-bottom:10px;
    font-family:Arial,Helvetica,sans-serif;
  ">
    Editorial
  </div>

  <!-- CONTENT -->
  <div style="
    font-size:15px;
    line-height:1.65;
    color:#202124;
    font-family:Arial,Helvetica,sans-serif;
  ">
    ${html}
  </div>

</td>
</tr>

<!-- SPACER (important Gmail) -->
<tr>
  <td height="6" style="font-size:0; line-height:0;">&nbsp;</td>
</tr>
`;
}
