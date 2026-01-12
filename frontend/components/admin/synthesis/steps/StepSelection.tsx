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
