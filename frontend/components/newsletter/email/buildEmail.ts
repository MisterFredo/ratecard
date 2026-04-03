import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem, // 👈 AJOUT
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

import { EmailLayout } from "./EmailLayout";
import { EmailHeader } from "./EmailHeader";
import { EmailStatsBlock } from "./EmailStatsBlock";
import { EmailNewsBlock } from "./EmailNewsBlock";
import { EmailBrevesBlock } from "./EmailBrevesBlock";
import { EmailAnalysesBlock } from "./EmailAnalysesBlock";
import { EmailNumbersBlock } from "./EmailNumbersBlock"; // 👈 NEW

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers?: NewsletterNumberItem[]; // 👈 NEW
  topicStats?: TopicStat[];
};

export function buildEmail({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers = [], // 👈 NEW
  topicStats = [],
}: Props) {

  const blocks = [
    EmailHeader(headerConfig, introText),

    /* =========================
        NUMBERS (🔥 AVANT LE CONTENU)
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
        STATS
    ========================== */
    headerConfig.showTopicStats && topicStats.length > 0
      ? EmailStatsBlock(topicStats)
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
  ].join("");

  return EmailLayout(blocks);
}
