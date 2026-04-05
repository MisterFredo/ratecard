import type { HeaderConfig } from "@/types/newsletter";
import { escapeHtml } from "./EmailHelpers";

export function EmailHeaderMedia(
  headerConfig: HeaderConfig
) {
  const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL || "";
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || "";

  /* =========================================================
     HERO CONFIG
  ========================================================= */

  const showHero =
    headerConfig.showHero !== false;

  const heroImage = headerConfig.eventId
    ? `${GCS}/events/EVENT_${headerConfig.eventId}_rect.jpg`
    : headerConfig.heroImageUrl
    ? headerConfig.heroImageUrl
    : `${BASE}/assets/brand/LeTouquet.jpg`;

  /* 🔥 lien propre (pas de #) */
  const heroLink =
    headerConfig.heroLink || null;

  /* =========================================================
     LOGO CONFIG
  ========================================================= */

  const showLogo =
    headerConfig.showLogo !== false;

  const logo =
    showLogo &&
    headerConfig.headerCompany?.media_logo_rectangle_id
      ? `https://storage.googleapis.com/ratecard-media/companies/${headerConfig.headerCompany.media_logo_rectangle_id}`
      : null;

  /* =========================================================
     RENDER
  ========================================================= */

  return `

  ${
    headerConfig.topBarEnabled !== false
      ? `
      <tr>
        <td colspan="2" style="
          height:5px;
          background:${headerConfig.topBarColor || "#84CC16"};
        "></td>
      </tr>`
      : ""
  }

<tr>
<td colspan="2" style="
  padding:0;
  background:#F3F4F6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

  ${
    showHero
      ? `
  <!-- HERO -->
  <div style="
    max-width:640px;
    margin:0 auto;
  ">
    ${
      heroLink
        ? `
        <a href="${heroLink}" target="_blank" style="display:block;">
          <img 
            src="${heroImage}" 
            style="
              width:100%;
              height:auto;
              display:block;
            "
          />
        </a>
        `
        : `
        <img 
          src="${heroImage}" 
          style="
            width:100%;
            height:auto;
            display:block;
          "
        />
        `
    }
  </div>
  `
      : ""
  }

  <!-- CONTENT -->
  <div style="
    max-width:640px;
    margin:0 auto;
    background:#FFFFFF;
    padding:20px 24px 14px 24px;
    border-bottom:1px solid #E5E7EB;
    text-align:center;
  ">

    ${
      logo
        ? `
        <div style="margin-bottom:10px;">
          ${
            headerConfig.logoLink
              ? `
              <a href="${headerConfig.logoLink}" target="_blank">
                <img src="${logo}" style="
                  max-width:100px;
                  height:auto;
                  opacity:0.9;
                " />
              </a>
              `
              : `
              <img src="${logo}" style="
                max-width:100px;
                height:auto;
                opacity:0.9;
              " />
              `
          }
        </div>
        `
        : ""
    }

    ${
      headerConfig.title
        ? `
        <div style="
          font-size:20px;
          font-weight:600;
          color:#111827;
          margin-bottom:6px;
        ">
          ${escapeHtml(headerConfig.title)}
        </div>
        `
        : ""
    }

    ${
      headerConfig.subtitle
        ? `
        <div style="
          font-size:16px;
          font-weight:500;
          color:#6B7280;
          margin-bottom:8px;
        ">
          ${escapeHtml(headerConfig.subtitle)}
        </div>
        `
        : ""
    }

    ${
      headerConfig.period
        ? `
        <div style="
          font-size:14px;
          font-weight:600;
          color:${headerConfig.periodColor || "#84CC16"};
        ">
          ${escapeHtml(headerConfig.period)}
        </div>
        `
        : ""
    }

  </div>

</td>
</tr>
`;
}
