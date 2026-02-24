"use client";

import { useMemo } from "react";
import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

import { buildEmail } from "./email/buildEmail";

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
};

export default function NewsletterPreview({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
}: Props) {

  const html = useMemo(() => {
    return buildEmail({
      headerConfig,
      introText,
      news,
      breves,
      analyses,
    });
  }, [headerConfig, introText, news, breves, analyses]);

  return (
    <section>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <iframe
          title="Newsletter preview"
          srcDoc={html}
          className="w-full h-[820px]"
        />
      </div>
    </section>
  );
}
