export function EmailLayoutGmail(content: string) {
  return `
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="
    padding:40px 48px;
    font-family:Arial,Helvetica,sans-serif;
    font-size:15px;
    line-height:1.7;
    color:#111827;
    background:#FFFFFF;
  ">

  ${content}

</td>
</tr>
</table>
`;
}
