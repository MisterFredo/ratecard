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
      max-width: 100% !important;
    }

    .mobile-padding {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    .stack-column {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding-right: 0 !important;
    }

    .mobile-center {
      text-align: center !important;
    }

    .responsive-img {
      height: auto !important;
    }

    .logo-img {
      max-width: 140px !important;
      height: auto !important;
    }

    .thumb-img {
      max-width: 260px !important;
      height: auto !important;
    }
  }
</style>
</head>

<body style="margin:0;padding:0;background:#F3F4F6;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F3F4F6;">
    <tr>
      <td align="center">

        <!-- MAIN CONTAINER -->
        <table
          width="720"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          class="container"
          style="
            width:100%;
            max-width:720px;
            margin:0 auto;
            background:#ffffff;
          "
        >
          <tr>
            <td
              class="mobile-padding"
              style="
                padding-left:32px;
                padding-right:32px;
              "
            >

              ${content}

              <!-- FOOTER -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="
                      padding:36px 0 26px 0;
                      font-size:12px;
                      color:#9CA3AF;
                      font-family:Arial,Helvetica,sans-serif;
                      line-height:1.5;
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
