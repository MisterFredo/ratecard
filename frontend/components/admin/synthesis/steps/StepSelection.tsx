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
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onValidate: () => void;
  onOpenAnalysis: (contentId: string) => void;
};

const MAX_SELECTION = 5;

export default function StepSelection({
  candidates,
  selectedIds,
  onChange,
  onValidate,
  onOpenAnalysis,
}: Props) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }

    if (selectedIds.length >= MAX_SELECTION) {
      alert(`Maximum ${MAX_SELECTION} analyses`);
      return;
    }

    onChange([...selectedIds, id]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-600">
          Sélectionnez les analyses à retenir pour la synthèse.
          <br />
          <span className="italic">
            Objectif : 3 à 5 analyses maximum.
          </span>
        </p>

        <div
          className={`text-sm font-semibold ${
            selectedIds.length > 0
              ? "text-ratecard-blue"
              : "text-gray-400"
          }`}
        >
          {selectedIds.length}/{MAX_SELECTION}
        </div>
      </div>

      <div className="space-y-3">
        {candidates.map((c) => {
          const selected = selectedIds.includes(c.ID_CONTENT);

          return (
            <div
              key={c.ID_CONTENT}
              className={`border rounded p-3 ${
                selected
                  ? "border-ratecard-blue bg-blue-50"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {c.ANGLE_TITLE}
                  </h4>

                  {c.EXCERPT && (
                    <p className="text-sm text-gray-600 mt-1">
                      {c.EXCERPT}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {c.PUBLISHED_AT
                      ? `Publié le ${new Date(
                          c.PUBLISHED_AT
                        ).toLocaleDateString()}`
                      : c.DATE_CREATION
                      ? `Créé le ${new Date(
                          c.DATE_CREATION
                        ).toLocaleDateString()}`
                      : null}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() =>
                      onOpenAnalysis(c.ID_CONTENT)
                    }
                    className="text-xs text-ratecard-blue underline"
                  >
                    Voir l’analyse
                  </button>

                  <button
                    onClick={() => toggle(c.ID_CONTENT)}
                    className={`px-3 py-1 rounded text-xs ${
                      selected
                        ? "bg-white border border-ratecard-blue text-ratecard-blue"
                        : "bg-ratecard-blue text-white"
                    }`}
                  >
                    {selected
                      ? "Retirer"
                      : "Sélectionner"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onValidate}
        disabled={selectedIds.length === 0}
        className={`px-4 py-2 rounded ${
          selectedIds.length > 0
            ? "bg-ratecard-blue text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        Valider la sélection
      </button>
    </div>
  );
}
