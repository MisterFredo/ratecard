// frontend/components/digest/delivery/email/buildDigestEmail.ts

import type {
  DigestContentItem,
  DigestNumberItem,
} from "@/types/digest";

import type {
  HeaderConfig,
} from "@/types/newsletter";

import {
  EmailLayout,
} from "@/components/delivery/email/EmailLayout";

import {
  EmailHeader,
} from "@/components/delivery/email/EmailHeader";

import {
  EmailEditorialBlock,
} from "@/components/delivery/email/EmailEditorialBlock";

import {
  EmailContentBlock,
} from "./EmailContentBlock";

import {
  EmailNumbersBlock,
} from "./EmailNumbersBlock";

/* ========================================================= */

type Props = {
  headerConfig: HeaderConfig;

  editorialHtml?: string;

  introText?: string;

  contents: DigestContentItem[];

  numbers: DigestNumberItem[];
};

/* ========================================================= */

export function buildDigestEmail({
  headerConfig,

  editorialHtml,

  introText,

  contents,

  numbers,
}: Props) {

  const editorial =
    editorialHtml ||
    introText ||
    "";

  const blocks = [

    EmailHeader(
      headerConfig
    ),

    editorial.trim()
      ? EmailEditorialBlock(
          editorial
        )
      : "",

    numbers.length > 0
      ? EmailNumbersBlock(
          numbers
        )
      : "",

    contents.length > 0
      ? EmailContentBlock(
          contents
        )
      : "",

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

  return EmailLayout(
    content
  );
}
