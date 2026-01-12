"use client";

type Candidate = {
  ID_CONTENT: string;
  ANGLE_TITLE: string;
  EXCERPT?: string;
  PUBLISHED_AT?: string;
  DATE_CREATION?: string;
};

type Props = {
  candidates: Candidate[];
  onValidate: () => void;
  onOpenAnalysis: (contentId: string) => void;
};

export default function StepCandidates({
  candidates,
  onValidate,
  onOpenAnalysis,
}: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Voici les analyses correspondant au périmètre et à la période
        sélectionnés.
      </p>

      {candidates.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          Aucune analyse trouvée pour ce périmètre.
        </p>
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => (
            <div
              key={c.ID_CONTENT}
              className="border rounded p-3 bg-gray-50"
            >
              <h4 className="font-semibold text-ratecard-blue">
                {c.ANGLE_TITLE}
              </h4>

              {c.EXCERPT && (
                <p className="text-sm text-gray-600 mt-1">
                  {c.EXCERPT}
                </p>
              )}

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {c.PUBLISHED_AT
                    ? `Publié le ${new Date(
                        c.PUBLISHED_AT
                      ).toLocaleDateString("fr-FR")}`
                    : c.DATE_CREATION
                    ? `Créé le ${new Date(
                        c.DATE_CREATION
                      ).toLocaleDateString("fr-FR")}`
                    : null}
                </p>

                <button
                  onClick={() => onOpenAnalysis(c.ID_CONTENT)}
                  className="text-xs text-ratecard-blue underline"
                >
                  Voir l’analyse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onValidate}
        disabled={candidates.length === 0}
        className={`px-4 py-2 rounded ${
          candidates.length > 0
            ? "bg-ratecard-blue text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continuer
      </button>
    </div>
  );
}
