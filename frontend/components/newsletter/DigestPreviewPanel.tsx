"use client";

import type {
  NewsletterNewsItem,
  NewsletterAnalysisItem,
  NewsletterNumberItem,
  HeaderConfig,
  TopicStat,
} from "@/types/newsletter";

/* =========================================================
   UTILS
========================================================= */

function formatValue(n: NewsletterNumberItem) {
  if (n.value === undefined || n.value === null) return "";

  const scaleMap: any = {
    thousand: "K",
    million: "M",
    millions: "M",
    billion: "Md",
    billions: "Md",
  };

  const scale = scaleMap[n.scale || ""] || "";
  const unit = n.unit || "";

  return [n.value, scale, unit]
    .filter(Boolean)
    .join(" ");
}

/* =========================================================
   TYPES
========================================================= */

type Props = {
  headerConfig: HeaderConfig;
  introText?: string;
  news: NewsletterNewsItem[];
  breves: NewsletterNewsItem[];
  analyses: NewsletterAnalysisItem[];
  numbers?: NewsletterNumberItem[];
  topicStats?: TopicStat[];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function NewsletterPreview({
  headerConfig,
  introText,
  news,
  breves,
  analyses,
  numbers = [],
  topicStats = [],
}: Props) {

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* =========================
          HEADER
      ========================== */}
      <div style={{
        padding: "40px",
        textAlign: "center",
        borderBottom: "1px solid #E5E7EB"
      }}>
        <div style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "10px",
          color: "#111827"
        }}>
          {headerConfig.title}
        </div>

        {headerConfig.subtitle && (
          <div style={{
            fontSize: "18px",
            color: "#6B7280"
          }}>
            {headerConfig.subtitle}
          </div>
        )}
      </div>

      {/* =========================
          INTRO
      ========================== */}
      {introText && (
        <div style={{
          padding: "24px 32px",
          fontSize: "14px",
          color: "#374151",
          lineHeight: "1.6"
        }}>
          {introText}
        </div>
      )}

      {/* =========================
          NUMBERS
      ========================== */}
      {numbers.length > 0 && (
        <div style={{ padding: "0 24px", marginTop: "20px" }}>

          {/* TITLE */}
          <div style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#111827",
            marginBottom: "18px",
            paddingLeft: "8px",
          }}>
            Chiffres clés
          </div>

          {/* GRID */}
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              {numbers.map((n) => (
                <td key={n.id} style={{ width: "50%", padding: "8px" }}>

                  <div style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "14px",
                  }}>

                    <div style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: "6px",
                    }}>
                      {formatValue(n)}
                    </div>

                    <div style={{
                      fontSize: "13px",
                      color: "#374151",
                    }}>
                      {n.label}
                    </div>

                  </div>

                </td>
              ))}
            </tr>
          </table>
        </div>
      )}

      {/* =========================
          NEWS
      ========================== */}
      {news.length > 0 && (
        <div style={{ padding: "24px" }}>
          <h3>News</h3>
          {news.map((n) => (
            <div key={n.id} style={{ marginBottom: "12px" }}>
              <strong>{n.title}</strong>
              <div>{n.excerpt}</div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          BRÈVES
      ========================== */}
      {breves.length > 0 && (
        <div style={{ padding: "24px" }}>
          <h3>Brèves</h3>
          {breves.map((b) => (
            <div key={b.id} style={{ marginBottom: "12px" }}>
              <strong>{b.title}</strong>
              <div>{b.excerpt}</div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          ANALYSES
      ========================== */}
      {analyses.length > 0 && (
        <div style={{ padding: "24px" }}>
          <h3>Analyses</h3>
          {analyses.map((a) => (
            <div key={a.id} style={{ marginBottom: "12px" }}>
              <strong>{a.title}</strong>
              <div>{a.excerpt}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
