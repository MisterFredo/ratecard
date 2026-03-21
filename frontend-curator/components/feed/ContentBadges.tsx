"use client";

type Props = {
  topics?: string[];
  companies?: string[];
  solutions?: string[];
  className?: string;
};

export default function ContentBadges({
  topics = [],
  companies = [],
  solutions = [],
  className = "",
}: Props) {
  // 👉 sécurité : éviter doublons / valeurs vides
  const clean = (arr: string[]) =>
    Array.from(new Set(arr.filter((v) => v && v.trim() !== "")));

  const cleanTopics = clean(topics);
  const cleanCompanies = clean(companies);
  const cleanSolutions = clean(solutions);

  // 👉 rien à afficher
  if (
    cleanTopics.length === 0 &&
    cleanCompanies.length === 0 &&
    cleanSolutions.length === 0
  ) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${className}`}>
      {/* =========================
          TOPICS
      ========================= */}
      {cleanTopics.map((t) => (
        <span
          key={`topic-${t}`}
          className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700"
        >
          {t}
        </span>
      ))}

      {/* =========================
          COMPANIES
      ========================= */}
      {cleanCompanies.map((c) => (
        <span
          key={`company-${c}`}
          className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700"
        >
          {c}
        </span>
      ))}

      {/* =========================
          SOLUTIONS
      ========================= */}
      {cleanSolutions.map((s) => (
        <span
          key={`solution-${s}`}
          className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
