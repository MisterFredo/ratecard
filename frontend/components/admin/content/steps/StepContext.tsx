"use client";

import ContentContextBlock from "@/components/admin/content/ContentContextBlock";

type Props = {
  topics: any[];
  events: any[];
  companies: any[];

  dateCreation: string;
  onChangeDateCreation: (value: string) => void;

  onChange: (data: {
    topics?: any[];
    events?: any[];
    companies?: any[];
  }) => void;

  onValidate: () => void;
};

export default function StepContext({
  topics,
  events,
  companies,
  dateCreation,
  onChangeDateCreation,
  onChange,
  onValidate,
}: Props) {
  return (
    <div className="space-y-6">
      <ContentContextBlock
        topics={topics}
        events={events}
        companies={companies}
        onChange={onChange}
      />

      {/* DATE ÉDITORIALE */}
      <div className="max-w-xs space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Date éditoriale
        </label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={dateCreation}
          onChange={(e) => onChangeDateCreation(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Date à laquelle le contenu est rattaché éditorialement
        </p>
      </div>

      <button
        onClick={onValidate}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>
    </div>
  );
}
