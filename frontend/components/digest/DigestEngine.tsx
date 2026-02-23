"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Props = {
  selectedTopics: SelectOption[];
  setSelectedTopics: (values: SelectOption[]) => void;

  selectedCompanies: SelectOption[];
  setSelectedCompanies: (values: SelectOption[]) => void;

  selectedTypes: SelectOption[];
  setSelectedTypes: (values: SelectOption[]) => void;

  onSearch: (filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
  }) => void;
};

export default function DigestEngine({
  selectedTopics,
  setSelectedTopics,
  selectedCompanies,
  setSelectedCompanies,
  selectedTypes,
  setSelectedTypes,
  onSearch,
}: Props) {
  const [topicOptions, setTopicOptions] = useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------
     Load référentiels
  --------------------------------------------------------- */
  useEffect(() => {
    async function loadReferentials() {
      try {
        const t = await api.get("/topic/list");
        const c = await api.get("/company/list");
        const nt = await api.get("/news/types");

        setTopicOptions(
          (t.topics || []).map((x: any) => ({
            id: x.id_topic,
            label: x.label,
          }))
        );

        setCompanyOptions(
          (c.companies || []).map((x: any) => ({
            id: x.id_company,
            label: x.name,
          }))
        );

        setTypeOptions(
          (nt.types || []).map((x: any) => ({
            id: x.code,
            label: x.label,
          }))
        );
      } catch (e) {
        console.error("Erreur chargement référentiels Digest", e);
      }
    }

    loadReferentials();
  }, []);

  /* ---------------------------------------------------------
     Search
  --------------------------------------------------------- */
  async function handleSearch() {
    setLoading(true);

    try {
      await onSearch({
        topics: selectedTopics.map((t) => t.id),
        companies: selectedCompanies.map((c) => c.id),
        news_types: selectedTypes.map((t) => t.id),
      });
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6 border rounded-lg p-6 bg-white">
      <h2 className="text-sm font-semibold">
        Moteur éditorial
      </h2>

      <SearchableMultiSelect
        label="Topics"
        options={topicOptions}
        values={selectedTopics}
        onChange={setSelectedTopics}
      />

      <SearchableMultiSelect
        label="Sociétés"
        options={companyOptions}
        values={selectedCompanies}
        onChange={setSelectedCompanies}
      />

      <SearchableMultiSelect
        label="Types"
        options={typeOptions}
        values={selectedTypes}
        onChange={setSelectedTypes}
      />

      <div className="pt-2">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
        >
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </div>
    </div>
  );
}
