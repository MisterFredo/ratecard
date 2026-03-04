"use client";

import ContentContextBlock from "@/components/admin/content/ContentContextBlock";

type Props = {
  topics: any[];
  events: any[];
  companies: any[];
  solutions: any[];

  onChange: (data: {
    topics?: any[];
    events?: any[];
    companies?: any[];
    solutions?: any[];
  }) => void;

  onValidate: () => void;
};

export default function StepContext({
  topics,
  events,
  companies,
  solutions,
  onChange,
  onValidate,
}: Props) {
  return (
    <div className="space-y-6">

      {/* CONTEXTE STRUCTURANT */}
      <ContentContextBlock
        topics={topics}
        events={events}
        companies={companies}
        solutions={solutions}
        onChange={onChange}
      />

      {/* ACTION */}
      <button
        onClick={onValidate}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>

    </div>
  );
}
