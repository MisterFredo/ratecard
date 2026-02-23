"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Props = {
  onSearch: (filters: {
    topics: string[];
    companies: string[];
    news_types: string[];
  }) => void;
};

export default function DigestEngine({ onSearch }: Props) {
  const [topicOptions, setTopicOptions] = useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);

  const [selectedTopics, setSelectedTopics] = useState<SelectOption[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<SelectOption[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SelectOption[]>([]);

  useEffect(() => {
    async function load() {
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
    }

    load();
  }, []);

  function handleSearch() {
    onSearch({
      topics: selectedTopics.map((t) => t.id),
      companies: selectedCompanies.map((c) => c.id),
      news_types: selectedTypes.map((t) => t.id),
    });
  }

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

      <button
        onClick={handleSearch}
        className="px-4 py-2 rounded bg-black text-white text-sm"
      >
        Rechercher
      </button>
    </div>
  );
}
