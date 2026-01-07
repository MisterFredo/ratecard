"use client";

import { useEffect, useState } from "react";
import TopicSelector from "@/components/admin/TopicSelector";
import EventSelector from "@/components/admin/EventSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector, {
  PersonRef,
  ArticlePerson,
} from "@/components/admin/PersonSelector";
import { api } from "@/lib/api";

type Props = {
  topics: any[];
  events: any[];
  companies: any[];
  persons: ArticlePerson[];

  onChange: (data: {
    topics?: any[];
    events?: any[];
    companies?: any[];
    persons?: ArticlePerson[];
  }) => void;
};

export default function ContentContextBlock({
  topics,
  events,
  companies,
  persons,
  onChange,
}: Props) {
  /* ---------------------------------------------------------
     PERSONNES — chargées UNE FOIS
  --------------------------------------------------------- */
  const [allPersons, setAllPersons] = useState<PersonRef[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(true);

  useEffect(() => {
    async function loadPersons() {
      try {
        const res = await api.get("/person/list");
        setAllPersons(
          (res.persons || []).map((p: any) => ({
            id_person: p.ID_PERSON,
            name: p.NAME,
            title: p.TITLE || "",
            id_company: p.ID_COMPANY || null,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement personnes", e);
        setAllPersons([]);
      } finally {
        setLoadingPersons(false);
      }
    }

    loadPersons();
  }, []);

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

      {/* COMPANIES (1 seule société max) */}
      <CompanySelector
        values={companies}
        onChange={(items) => {
          onChange({ companies: items });
          // reset des personnes quand la société change
          onChange({ persons: [] });
        }}
      />

      {/* PERSONS — filtrées côté selector */}
      <PersonSelector
        values={persons}
        persons={allPersons}
        companyId={companies[0]?.id_company || null}
        onChange={(items) => onChange({ persons: items })}
      />
    </div>
  );
}
