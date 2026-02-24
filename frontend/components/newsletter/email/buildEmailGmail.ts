import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

import { EmailLayoutGmail } from "./EmailLayoutGmail";
import { EmailHeaderGmail } from "./EmailHeaderGmail";
import { EmailNewsBlockGmail } from "./EmailNewsBlockGmail";
import { EmailStatsBlockGmail } from "./EmailStatsBlockGmail";
import { EmailBrevesBlockGmail } from "./EmailBrevesBlockGmail";
import { EmailAnalysesBlockGmail } from "./EmailAnalysesBlockGmail";
import { EmailSignatureGmail } from "./EmailSignatureGmail";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  topicStats?: TopicStat[];
};

export function buildEmailGmail({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  topicStats = [],
}: Props) {

  const content = `
    ${EmailHeaderGmail(headerConfig, introText)}
    ${EmailNewsBlockGmail(news)}
    ${EmailStatsBlockGmail(topicStats)}
    ${EmailBrevesBlockGmail(breves)}
    ${EmailAnalysesBlockGmail(analyses)}
    ${EmailSignatureGmail()}
  `;

  return EmailLayoutGmail(content);
}
