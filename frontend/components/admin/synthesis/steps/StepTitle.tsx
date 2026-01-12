"use client";

type Props = {
  title: string;
  onChange: (value: string) => void;
  onValidate: () => void;
};

export default function StepTitle({ title, onChange, onValidate }: Props) {
  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-gray-600">
        Donnez un titre opérationnel à cette synthèse.
        <br />
        <span className="italic">
          Repère interne, non marketing, non interprétatif.
        </span>
      </p>

      <input
        type="text"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded p-2 w-full"
        placeholder="Retail Media — Synthèse chiffrée (janvier 2026)"
      />

      <button
        onClick={onValidate}
        disabled={!title.trim()}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>
    </div>
  );
}
