import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

import { EmailLayout } from "./EmailLayout";
import { EmailHeader } from "./EmailHeader";
import { EmailStatsBlock } from "./EmailStatsBlock";
import { EmailNewsBlock } from "./EmailNewsBlock";
import { EmailBrevesBlock } from "./EmailBrevesBlock";
import { EmailAnalysesBlock } from "./EmailAnalysesBlock";
import { EmailNumbersBlock } from "./EmailNumbersBlock";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers?: NewsletterNumberItem[];
  topicStats?: TopicStat[];
};

export function buildEmail({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers = [],
  topicStats = [],
}: Props) {

  const blocks = [

    /* =========================
        HEADER
    ========================== */
    EmailHeader(headerConfig, introText),

    /* =========================
        NUMBERS
    ========================== */
    numbers.length > 0
      ? EmailNumbersBlock(numbers)
      : "",

    /* =========================
        NEWS
    ========================== */
    news.length > 0
      ? EmailNewsBlock(news)
      : "",

    /* =========================
        BRÈVES
    ========================== */
    breves.length > 0
      ? EmailBrevesBlock(breves)
      : "",

    /* =========================
        ANALYSES
    ========================== */
    analyses.length > 0
      ? EmailAnalysesBlock(analyses)
      : "",

    /* =========================
        STATS (FIN)
    ========================== */
    headerConfig.showTopicStats && topicStats.length > 0
      ? EmailStatsBlock(topicStats)
      : "",

  ].join("");

  /* 🔥 CRITIQUE : wrapper TABLE */
  const content = `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    ${blocks}
  </table>
  `;

  return EmailLayout(content);
}
