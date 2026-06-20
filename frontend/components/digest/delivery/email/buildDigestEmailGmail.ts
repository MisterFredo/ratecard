// frontend/components/digest/delivery/email/buildDigestEmailGmail.ts

import type {
  DigestContentItem,
} from "@/types/digest";

import type {
  HeaderConfig,
} from "@/types/newsletter";

import {
  EmailLayoutGmail,
} from "@/components/delivery/email/EmailLayoutGmail";

import {
  EmailHeaderGmail,
} from "@/components/delivery/email/EmailHeaderGmail";

import {
  EmailEditorialBlockGmail,
} from "@/components/delivery/email/EmailEditorialBlockGmail";

import {
  EmailSignatureGmail,
} from "@/components/delivery/email/EmailSignatureGmail";

import {
  EmailContentBlockGmail,
} from "./EmailContentBlockGmail";

/* ========================================================= */

type Props = {
  headerConfig: HeaderConfig;

  editorialHtml?: string;

  introText?: string;

  summary?: string;

  implications?: string;

  contents: DigestContentItem[];
};

/* ========================================================= */

function analysisBlockGmail(
  title: string,
  content?: string,
) {

  if (!content?.trim()) {
    return "";
  }

  return `
  <tr>
    <td
      style="
        padding:24px 32px 8px 32px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:18px;
        font-weight:700;
        color:#111827;
      "
    >
      ${title}
    </td>
  </tr>

  <tr>
    <td
      style="
        padding:0 32px 24px 32px;
        font-family:Arial,Helvetica,sans-serif;
        font-size:14px;
        line-height:1.7;
        color:#374151;
        white-space:pre-wrap;
      "
    >
      ${content}
    </td>
  </tr>
  `;
}

/* ========================================================= */

export function buildDigestEmailGmail({
  headerConfig,

  editorialHtml,

  introText,

  summary,

  implications,

  contents,
}: Props) {

  const editorial =
    editorialHtml ||
    introText ||
    "";

  const blocks = [

    EmailHeaderGmail(
      headerConfig
    ),

    editorial.trim()
      ? EmailEditorialBlockGmail(
          editorial
        )
      : "",

    analysisBlockGmail(
      "Weekly Summary",
      summary
    ),

    analysisBlockGmail(
      "Key Implications",
      implications
    ),

    contents.length > 0
      ? EmailContentBlockGmail(
          contents
        )
      : "",

    EmailSignatureGmail(),

  ].join("");

  const content = `
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
  >
    ${blocks}
  </table>
  `;

  return EmailLayoutGmail(
    content
  );
}
