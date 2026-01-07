"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector, {
  PersonRef,
  ArticlePerson,
} from "@/components/admin/PersonSelector";

type Props = {
  title: string;
  body: string;

  company: any | null;
  topics: any[];
  persons: ArticlePerson[];

  onChange: (d: {
    title?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: ArticlePerson[];
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

export default function NewsStepContent({
  title,
  body,
  company,
  topics,
  persons,
  onChange,
  onValidate,
  saving,
}: Props) {
  /* ---------------------------------------------------------
     PERSONNES — chargées UNE FOIS (comme ContentContextBlock)
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

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* SOCIÉTÉ (OBLIGATOIRE) */}
      <CompanySelector
        values={company ? [company] : []}
        onChange={(items) => {
          onChange({ company: items[0] || null });
          // reset des personnes si la société change
          onChange({ persons: [] });
        }}
      />

      {/* TITRE */}
      <div>
        <label className="block font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* TEXTE */}
      <div>
        <label className="block font-medium mb-1">Texte</label>
        <textarea
          className="w-full border rounded p-2 h-32"
          value={body}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </div>

      {/* TOPICS (BADGES) */}
      <TopicSelector
        values={topics}
        onChange={(items) => onChange({ topics: items })}
      />

      {/* PERSONNES */}
      <PersonSelector
        values={persons}
        persons={allPersons}
        companyId={company?.id_company || company?.ID_COMPANY || null}
        onChange={(items) => onChange({ persons: items })}
      />

      {/* ACTION */}
      <div className="pt-4">
        <button
          onClick={onValidate}
          disabled={saving}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
