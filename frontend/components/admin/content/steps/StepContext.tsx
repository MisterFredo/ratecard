"use client";

import TopicSelector from "@/components/admin/TopicSelector";
import EventSelector from "@/components/admin/EventSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import SolutionSelector from "@/components/admin/SolutionSelector";

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

      {/* SELECTORS */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <TopicSelector
          values={topics}
          onChange={(items) => onChange({ topics: items })}
        />

        <EventSelector
          values={events}
          onChange={(items) => onChange({ events: items })}
        />

        <CompanySelector
          values={companies}
          onChange={(items) => onChange({ companies: items })}
        />

        <SolutionSelector
          values={solutions}
          onChange={(items) => onChange({ solutions: items })}
        />

      </div>


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
