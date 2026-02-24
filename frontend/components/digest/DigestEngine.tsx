"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

type Period = "total" | "30d" | "7d";

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
    period: Period;
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
  const [topicOptions, setTopicOptions] =
    useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] =
    useState<SelectOption[]>([]);
  const [typeOptions, setTypeOptions] =
    useState<SelectOption[]>([]);
  const [period, setPeriod] =
    useState<Period>("total");
  const [loading, setLoading] =
    useState(false);

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
        companies: selectedCompanies.map(
          (c) => c.id
        ),
        news_types: selectedTypes.map(
          (t) => t.id
        ),
        period,
      });
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Moteur éditorial
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-end">

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

        {/* PERIOD */}
        <div className="flex gap-1">
          {(["7d", "30d", "total"] as Period[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  h-8
                  px-3
                  rounded
                  text-xs
                  transition
                  ${
                    period === p
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {p === "7d"
                  ? "7j"
                  : p === "30d"
                  ? "30j"
                  : "Tout"}
              </button>
            )
          )}
        </div>

        {/* SEARCH */}
        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="
              h-8
              px-4
              rounded
              bg-black
              text-white
              text-xs
              font-medium
              transition
              hover:bg-gray-800
              disabled:opacity-50
            "
          >
            {loading
              ? "Recherche…"
              : "Rechercher"}
          </button>
        </div>

      </div>
    </div>
  );
}
