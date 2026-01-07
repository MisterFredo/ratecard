"use client";

import { useEffect, useState } from "react";
import TopicSelector from "@/components/admin/TopicSelector";
import EventSelector from "@/components/admin/EventSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector from "@/components/admin/PersonSelector";
import { api } from "@/lib/api";

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
  const [availablePersons, setAvailablePersons] = useState<any[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(false);

  /* ---------------------------------------------------------
     Chargement des personnes UNIQUEMENT si société sélectionnée
  --------------------------------------------------------- */
  useEffect(() => {
    // Aucune société → aucune personne
    if (companies.length === 0) {
      setAvailablePersons([]);
      onChange({ persons: [] });
      return;
    }

    // ⚠️ Règle simple : une seule société active
    const companyId = companies[0].id_company;

    setLoadingPersons(true);

    api
      .get(`/person/list?company_id=${companyId}`)
      .then((res) => {
        setAvailablePersons(res.persons || []);
        // reset sélection personnes
        onChange({ persons: [] });
      })
      .catch(() => {
        setAvailablePersons([]);
      })
      .finally(() => {
        setLoadingPersons(false);
      });
  }, [companies]);

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
        persons={allPersons}
        companyId={companies[0]?.id_company || null}
        onChange={(items) => onChange({ persons: items })}
      />
    </div>
  );
}

