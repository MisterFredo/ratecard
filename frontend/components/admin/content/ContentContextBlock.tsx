"use client";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import EventSelector from "@/components/admin/EventSelector";

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
        selected={topics}
        onChange={(items) => onChange({ topics: items })}
      />

      {/* EVENTS */}
      <EventSelector
        selected={events}
        onChange={(items) => onChange({ events: items })}
      />

      {/* COMPANIES */}
      <CompanySelector
        selected={companies}
        onChange={(items) => onChange({ companies: items })}
      />

      {/* PERSONS */}
      <PersonSelector
        selected={persons}
        onChange={(items) => onChange({ persons: items })}
      />
    </div>
  );
}
