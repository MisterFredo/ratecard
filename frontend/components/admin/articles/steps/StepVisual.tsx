"use client";

import ArticleVisualSection from "@/components/admin/articles/ArticleVisualSection";

const GCS = process.env.NEXT_PUBLIC_GCS_BASE_URL!;

type VisualChoice = "TOPIC" | "COMPANY" | "PERSON" | "ARTICLE";

type Topic = {
  id_topic: string;
  label: string;
};

type Company = {
  id_company: string;
  name: string;
};

type Person = {
  id_person: string;
  name: string;
};

type Props = {
  visualChoice: VisualChoice;
  setVisualChoice: (v: VisualChoice) => void;

  topics: Topic[];
  companies: Company[];
  persons: Person[];

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
  /* ---------------------------------------------------------
     Helpers pour construire les URLs GCS
  --------------------------------------------------------- */
  function topicSquare(id: string) {
    return `${GCS}/topics/TOPIC_${id}_square.jpg`;
  }

  function topicRect(id: string) {
    return `${GCS}/topics/TOPIC_${id}_rect.jpg`;
  }

  function companySquare(id: string) {
    return `${GCS}/companies/COMPANY_${id}_square.jpg`;
  }

  function companyRect(id: string) {
    return `${GCS}/companies/COMPANY_${id}_rect.jpg`;
  }

  function personSquare(id: string) {
    return `${GCS}/persons/PERSON_${id}_square.jpg`;
  }

  function personRect(id: string) {
    return `${GCS}/persons/PERSON_${id}_rect.jpg`;
  }

  /* ---------------------------------------------------------
     Sélection d’un visuel existant
  --------------------------------------------------------- */
  function useExistingVisual(
    square: string | null,
    rectangle: string | null
  ) {
    onUpdated({
      square,
      rectangle,
    });
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-4">

      <p className="text-sm text-gray-600">
        Choisissez la source du visuel de l’article.
      </p>

      {/* CHOIX SOURCE */}
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

      {/* LISTE VISUELS EXISTANTS */}
      {visualChoice === "TOPIC" && (
        <div className="space-y-3">
          {topics.map((t) => (
            <div
              key={t.id_topic}
              className="flex items-center gap-4 border rounded p-2"
            >
              <img
                src={topicSquare(t.id_topic)}
                className="w-16 h-16 border rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{t.label}</p>
              </div>
              <button
                onClick={() =>
                  useExistingVisual(
                    topicSquare(t.id_topic),
                    topicRect(t.id_topic)
                  )
                }
                className="px-3 py-1 border rounded"
              >
                Utiliser
              </button>
            </div>
          ))}
        </div>
      )}

      {visualChoice === "COMPANY" && (
        <div className="space-y-3">
          {companies.map((c) => (
            <div
              key={c.id_company}
              className="flex items-center gap-4 border rounded p-2"
            >
              <img
                src={companySquare(c.id_company)}
                className="w-16 h-16 border rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
              </div>
              <button
                onClick={() =>
                  useExistingVisual(
                    companySquare(c.id_company),
                    companyRect(c.id_company)
                  )
                }
                className="px-3 py-1 border rounded"
              >
                Utiliser
              </button>
            </div>
          ))}
        </div>
      )}

      {visualChoice === "PERSON" && (
        <div className="space-y-3">
          {persons.map((p) => (
            <div
              key={p.id_person}
              className="flex items-center gap-4 border rounded p-2"
            >
              <img
                src={personSquare(p.id_person)}
                className="w-16 h-16 border rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
              </div>
              <button
                onClick={() =>
                  useExistingVisual(
                    personSquare(p.id_person),
                    personRect(p.id_person)
                  )
                }
                className="px-3 py-1 border rounded"
              >
                Utiliser
              </button>
            </div>
          ))}
        </div>
      )}

      {/* VISUEL SPÉCIFIQUE */}
      {visualChoice === "ARTICLE" && (
        <ArticleVisualSection
          articleId={articleId}
          squareUrl={squareUrl}
          rectUrl={rectUrl}
          onUpdated={onUpdated}
        />
      )}

      {/* CONTINUER */}
      <button
        onClick={onNext}
        className="mt-4 bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer vers aperçu
      </button>
    </div>
  );
}
