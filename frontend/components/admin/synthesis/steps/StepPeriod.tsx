"use client";

type Props = {
  dateFrom: string;
  dateTo: string;
  onChange: (data: {
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  onValidate: () => void;
};

export default function StepPeriod({
  dateFrom,
  dateTo,
  onChange,
  onValidate,
}: Props) {
  const isValid = Boolean(dateFrom && dateTo && dateFrom <= dateTo);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Définissez la période sur laquelle les analyses seront
        sélectionnées.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        {/* DATE FROM */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Date de début
          </label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={dateFrom}
            onChange={(e) =>
              onChange({ dateFrom: e.target.value })
            }
          />
        </div>

        {/* DATE TO */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Date de fin
          </label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={dateTo}
            onChange={(e) =>
              onChange({ dateTo: e.target.value })
            }
          />
        </div>
      </div>

      {!isValid && (
        <p className="text-xs text-red-500">
          La période doit être valide (date de début ≤ date de fin).
        </p>
      )}

      <button
        onClick={onValidate}
        disabled={!isValid}
        className={`px-4 py-2 rounded ${
          isValid
            ? "bg-ratecard-blue text-white"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continuer
      </button>
    </div>
  );
}
