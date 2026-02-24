import type { HeaderConfig } from "@/types/newsletter";

export function EmailHeaderGmail(
  headerConfig: HeaderConfig,
  introText?: string
) {
  const logo =
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  return `
<div style="margin-bottom:40px;">

  ${
    logo
      ? `
      <div style="margin-bottom:18px;">
        <img src="${logo}"
             width="140"
             style="display:block;" />
      </div>
      `
      : ""
  }

  ${
    headerConfig.title
      ? `
      <div style="
          font-size:22px;
          font-weight:600;
          color:#111827;
          margin-bottom:8px;
          line-height:1.3;
        ">
        ${headerConfig.title}
      </div>
      `
      : ""
  }

  ${
    headerConfig.subtitle
      ? `
      <div style="
          font-size:15px;
          color:#6B7280;
          margin-bottom:14px;
        ">
        ${headerConfig.subtitle}
      </div>
      `
      : ""
  }

  ${
    introText
      ? `
      <div style="
          font-size:15px;
          color:#374151;
          line-height:1.7;
          margin-top:6px;
        ">
        ${introText.replace(/\n/g, "<br/>")}
      </div>
      `
      : ""
  }

</div>
`;
}
