export function EmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<base target="_blank" />
<style>
  @media only screen and (max-width: 600px) {
    .container {
      width: 100% !important;
      padding: 0 16px !important;
    }
    .mobile-padding {
      padding: 0 16px !important;
    }
    .mobile-center {
      text-align: center !important;
    }
  }
</style>
</head>

<body style="margin:0;padding:0;background:#F3F4F6;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">

        <!-- OUTER CONTAINER -->
        <table
          width="680"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          class="container"
          style="
            width:100%;
            max-width:680px;
            margin:0 auto;
            background:#ffffff;
          "
        >
          <tr>
            <td
              class="mobile-padding"
              style="padding:0 32px;"
            >

              ${content}

              <!-- FOOTER -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="
                      padding:40px 0 30px 0;
                      font-size:12px;
                      color:#9CA3AF;
                      font-family:Arial,Helvetica,sans-serif;
                    ">
                    © Ratecard – Lecture stratégique du marché
                  </td>
                </tr>
              </table>

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
