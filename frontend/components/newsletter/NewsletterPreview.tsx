"use client";

import { useMemo, useRef } from "react";
import { buildEmail } from "./email/buildEmail";
import type {
  NewsletterNewsItem,
  HeaderConfig,
  NewsletterAnalysisItem,
} from "@/types/newsletter";

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

  const hiddenRef = useRef<HTMLDivElement>(null);

  /* ======================================
     COPY RAW HTML (BREVO)
  ====================================== */
  function copyHtml() {
    navigator.clipboard.writeText(html);
    alert("HTML copié pour Brevo.");
  }

  /* ======================================
     COPY RENDERED VERSION (GMAIL)
  ====================================== */
  function copyForGmail() {
    if (!hiddenRef.current) return;

    const container = hiddenRef.current;
    container.innerHTML = html;

    const range = document.createRange();
    range.selectNodeContents(container);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    document.execCommand("copy");

    selection?.removeAllRanges();
    container.innerHTML = "";

    alert("Version Gmail copiée.");
  }

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Preview newsletter
        </h2>

        <div className="flex gap-2">
          <button
            onClick={copyHtml}
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
          >
            Copier HTML (Brevo)
          </button>

          <button
            onClick={copyForGmail}
            className="px-3 py-1.5 rounded bg-white border border-gray-300 text-xs"
          >
            Copier pour Gmail
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <iframe
          title="Newsletter preview"
          srcDoc={html}
          className="w-full h-[720px]"
        />
      </div>

      {/* Hidden container used for Gmail copy */}
      <div
        ref={hiddenRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      />
    </section>
  );
}
