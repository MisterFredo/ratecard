export function EmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<base target="_blank" />
</head>
<body style="margin:0;padding:0;background:#F3F4F6;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0"
       style="max-width:680px;margin:0 auto;background:#ffffff;padding:0 32px;">
${content}
<tr>
<td colspan="2" style="padding:40px 0 30px 0;font-size:12px;color:#9CA3AF;">
© Ratecard – Lecture stratégique du marché
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;
}
