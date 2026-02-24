export function EmailLayoutGmail(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="
    margin:0;
    padding:0;
    background:#ffffff;
    font-family:Arial,Helvetica,sans-serif;
    color:#111827;
  ">

  <div style="
      max-width:720px;
      margin:0;
      padding:0;
    ">

    ${content}

  </div>

</body>
</html>
`;
}
