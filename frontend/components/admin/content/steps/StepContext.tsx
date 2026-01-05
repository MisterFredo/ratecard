"use client";

import ContentContextBlock from "@/components/admin/content/ContentContextBlock";

type Props = {
  topics: any[];
  events: any[];
  companies: any[];
  persons: any[];
  onChange: (data: {
    topics?: any[];
    events?: any[];
    companies?: any[];
    persons?: any[];
  }) => void;
  onValidate: () => void;
};

export default function StepContext({
  topics,
  events,
  companies,
  persons,
  onChange,
  onValidate,
}: Props) {
  return (
    <div className="space-y-4">
      <ContentContextBlock
        topics={topics}
        events={events}
        companies={companies}
        persons={persons}
        onChange={onChange}
      />

      <button
        onClick={onValidate}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Valider le contexte
      </button>
    </div>
  );
}
