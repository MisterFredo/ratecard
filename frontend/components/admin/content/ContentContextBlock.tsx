"use client";

import TopicSelector from "@/components/admin/TopicSelector";
import EventSelector from "@/components/admin/EventSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";

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
};

export default function ContentContextBlock({
  topics,
  events,
  companies,
  persons,
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

      {/* COMPANIES */}
      <CompanySelector
        values={companies}
        onChange={(items) => onChange({ companies: items })}
      />

      {/* PERSONS */}
      <PersonSelector
        values={persons}
        onChange={(items) => onChange({ persons: items })}
      />
    </div>
  );
}
