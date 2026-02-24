import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  HeaderConfig,
} from "@/types/newsletter";

import { EmailLayout } from "./EmailLayout";
import { EmailHeader } from "./EmailHeader";
import { EmailStatsBlock } from "./EmailStatsBlock";
import { EmailNewsBlock } from "./EmailNewsBlock";
import { EmailBrevesBlock } from "./EmailBrevesBlock";
import { EmailAnalysesBlock } from "./EmailAnalysesBlock";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

export function buildEmail({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
}: Props) {

  const content = `
    ${EmailHeader(headerConfig, introText)}
    ${EmailStatsBlock()}
    ${EmailNewsBlock(news)}
    ${EmailBrevesBlock(breves)}
    ${EmailAnalysesBlock(analyses)}
  `;

  return EmailLayout(content);
}
