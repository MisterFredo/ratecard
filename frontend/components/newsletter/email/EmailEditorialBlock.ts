export function EmailEditorialBlock(html: string) {
  return `
<tr>
<td style="
  padding:20px 24px;
  background:#FFFFFF;
  border-bottom:1px solid #E5E7EB;
">

  <div style="
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:0.12em;
    color:#9CA3AF;
    margin-bottom:12px;
  ">
    Editorial
  </div>

  <div style="
    font-size:15px;
    line-height:1.7;
    color:#374151;
  ">
    ${html}
  </div>

</td>
</tr>
`;
}
