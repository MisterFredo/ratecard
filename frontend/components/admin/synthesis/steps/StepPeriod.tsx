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
  return (
    <div className="space-y-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium">
          Date de début
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) =>
            onChange({ dateFrom: e.target.value })
          }
          className="border rounded p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Date de fin
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) =>
            onChange({ dateTo: e.target.value })
          }
          className="border rounded p-2 w-full"
        />
      </div>

      <button
        onClick={onValidate}
        disabled={!dateFrom || !dateTo}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>
    </div>
  );
}
