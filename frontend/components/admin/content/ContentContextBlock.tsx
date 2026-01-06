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

  /**
   * 🔑 Règle UX :
   * - si une société est sélectionnée → on filtre les personnes
   * - sinon → toutes les personnes sont disponibles
   */
  const filteredPersons =
    companies.length === 0
      ? persons
      : persons.filter((p) =>
          companies.some(
            (c) =>
              p.id_company === c.id_company ||
              p.company_id === c.id_company
          )
        );

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
        onChange={(items) => {
          onChange({ companies: items });

          /**
           * 🧠 Important :
           * si on change les sociétés, on nettoie les personnes incohérentes
           */
          onChange({
            persons: filteredPersons.filter((p) =>
              items.some(
                (c) =>
                  p.id_company === c.id_company ||
                  p.company_id === c.id_company
              )
            ),
          });
        }}
      />

      {/* PERSONS (FILTRÉES) */}
      <PersonSelector
        values={filteredPersons}
        onChange={(items) => onChange({ persons: items })}
      />
    </div>
  );
}
