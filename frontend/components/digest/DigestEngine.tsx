"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ========================================================= */

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

/* ========================================================= */

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
            id: x.ID_TOPIC,
            label: x.LABEL,
          }))
        );

        setCompanyOptions(
          (c.companies || []).map((x: any) => ({
            id: x.ID_COMPANY,
            label: x.NAME,
          }))
        );

        setTypeOptions(
          (nt.types || []).map((x: any) => ({
            id: x.code,
            label: x.label,
          }))
        );
      } catch (e) {
        console.error(
          "Erreur chargement référentiels Digest",
          e
        );
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
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-gray-900">
          Moteur éditorial
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_auto] gap-6 items-end">

        {/* TOPICS */}
        <SearchableMultiSelect
          label="Topics"
          options={topicOptions}
          values={selectedTopics}
          onChange={setSelectedTopics}
        />

        {/* SOCIÉTÉS */}
        <SearchableMultiSelect
          label="Sociétés"
          options={companyOptions}
          values={selectedCompanies}
          onChange={setSelectedCompanies}
        />

        {/* TYPES */}
        <SearchableMultiSelect
          label="Types"
          options={typeOptions}
          values={selectedTypes}
          onChange={setSelectedTypes}
        />

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="
              h-[42px]
              px-6
              rounded-lg
              bg-black
              text-white
              text-sm
              font-medium
              transition
              hover:bg-gray-800
              disabled:opacity-50
            "
          >
            {loading ? "Recherche…" : "Rechercher"}
          </button>
        </div>

      </div>
    </div>
  );
}
