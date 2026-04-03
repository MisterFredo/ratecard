import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem, // 👈 NEW
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

import { EmailLayoutGmail } from "./EmailLayoutGmail";
import { EmailHeaderGmail } from "./EmailHeaderGmail";
import { EmailNewsBlockGmail } from "./EmailNewsBlockGmail";
import { EmailStatsBlockGmail } from "./EmailStatsBlockGmail";
import { EmailBrevesBlockGmail } from "./EmailBrevesBlockGmail";
import { EmailAnalysesBlockGmail } from "./EmailAnalysesBlockGmail";
import { EmailNumbersBlockGmail } from "./EmailNumbersBlockGmail"; // 👈 NEW
import { EmailSignatureGmail } from "./EmailSignatureGmail";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers?: NewsletterNumberItem[]; // 👈 NEW
  topicStats?: TopicStat[];
};

export function buildEmailGmail({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers = [], // 👈 NEW
  topicStats = [],
}: Props) {

  const blocks = [

    EmailHeaderGmail(headerConfig),

    /* =========================
        NUMBERS 🔥
    ========================== */
    numbers.length > 0
      ? EmailNumbersBlockGmail(numbers)
      : "",

    /* =========================
        NEWS
    ========================== */
    news.length > 0
      ? EmailNewsBlockGmail(news)
      : "",

    /* =========================
        STATS
    ========================== */
    headerConfig.showTopicStats && topicStats.length > 0
      ? EmailStatsBlockGmail(topicStats)
      : "",

    /* =========================
        BRÈVES
    ========================== */
    breves.length > 0
      ? EmailBrevesBlockGmail(breves)
      : "",

    /* =========================
        ANALYSES
    ========================== */
    analyses.length > 0
      ? EmailAnalysesBlockGmail(analyses)
      : "",

    /* =========================
        SIGNATURE
    ========================== */
    EmailSignatureGmail()

  ].join("");

  return EmailLayoutGmail(blocks);
}
