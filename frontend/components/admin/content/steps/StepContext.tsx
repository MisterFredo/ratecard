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

  function validate() {

    const hasContext =
      topics.length ||
      events.length ||
      companies.length ||
      solutions.length;

    if (!hasContext) {
      alert("Merci d'ajouter au moins un élément de contexte.");
      return;
    }

    onValidate();
  }

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
        onClick={validate}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>

    </div>

  );
}
