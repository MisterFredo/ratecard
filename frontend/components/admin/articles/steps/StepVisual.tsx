"use client";

import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

type VisualChoice = "TOPIC" | "COMPANY" | "PERSON" | "ARTICLE";

type Props = {
  visualChoice: VisualChoice;
  setVisualChoice: (v: VisualChoice) => void;

  topics: any[];
  companies: any[];
  persons: any[];

  articleId: string;
  squareUrl: string | null;
  rectUrl: string | null;

  onUpdated: (urls: { square: string | null; rectangle: string | null }) => void;
  onNext: () => void;
};

export default function StepVisual({
  visualChoice,
  setVisualChoice,
  topics,
  companies,
  persons,
  articleId,
  squareUrl,
  rectUrl,
  onUpdated,
  onNext,
}: Props) {
  return (
    <div className="space-y-4">

      <p className="text-sm text-gray-600">
        Choisissez la source du visuel de l’article.
      </p>

      {/* CHOIX DE LA SOURCE */}
      <div className="flex flex-wrap gap-3">
        {topics.length > 0 && (
          <button
            onClick={() => setVisualChoice("TOPIC")}
            className={`px-3 py-2 border rounded ${
              visualChoice === "TOPIC" ? "bg-gray-100" : ""
            }`}
          >
            Topic
          </button>
        )}

        {companies.length > 0 && (
          <button
            onClick={() => setVisualChoice("COMPANY")}
            className={`px-3 py-2 border rounded ${
              visualChoice === "COMPANY" ? "bg-gray-100" : ""
            }`}
          >
            Société
          </button>
        )}

        {persons.length > 0 && (
          <button
            onClick={() => setVisualChoice("PERSON")}
            className={`px-3 py-2 border rounded ${
              visualChoice === "PERSON" ? "bg-gray-100" : ""
            }`}
          >
            Personne
          </button>
        )}

        <button
          onClick={() => setVisualChoice("ARTICLE")}
          className={`px-3 py-2 border rounded ${
            visualChoice === "ARTICLE" ? "bg-gray-100" : ""
          }`}
        >
          Visuel spécifique
        </button>
      </div>

      {/* VISUEL SPÉCIFIQUE À L’ARTICLE */}
      {visualChoice === "ARTICLE" && (
        <ArticleVisualSection
          articleId={articleId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={onUpdated}
        />
      )}

      <button
        onClick={onNext}
        className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer vers aperçu
      </button>
    </div>
  );
}
