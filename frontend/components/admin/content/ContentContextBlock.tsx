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
};

export default function ContentContextBlock({
  topics,
  events,
  companies,
  solutions,
  onChange,
}: Props) {
  return (
    <div className="space-y-6">
      {/* TOPICS */}
      <TopicSelector
        values={topics}
        onChange={(items) => onChange({ topics: items })}
      />

      {/* EVENTS */}
      <EventSelector
        values={events}
        onChange={(items) => onChange({ events: items })}
      />

      {/* COMPANIES — MULTI SELECT */}
      <CompanySelector
        values={companies}
        onChange={(items) => onChange({ companies: items })}
      />

      {/* SOLUTIONS */}
      <SolutionSelector
        values={solutions}
        onChange={(items) => onChange({ solutions: items })}
      />
    </div>
  );
}
