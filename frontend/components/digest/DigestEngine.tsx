// frontend/components/digest/DigestEngine.tsx

"use client";

import {
  useEffect,
  useState,
} from "react";

import { api } from "@/lib/api";

import SearchableMultiSelect, {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ========================================================= */

type Period =
  | "total"
  | "30d"
  | "7d";

/* ========================================================= */

type Props = {
  query: string;

  setQuery: (
    value: string
  ) => void;

  selectedTopics:
    SelectOption[];

  setSelectedTopics: (
    values:
      SelectOption[]
  ) => void;

  selectedCompanies:
    SelectOption[];

  setSelectedCompanies: (
    values:
      SelectOption[]
    ) => void;

  selectedSolutions:
    SelectOption[];

  setSelectedSolutions: (
    values:
      SelectOption[]
  ) => void;

  onSearch: (
    filters: {
      query: string;

      topics: string[];

      companies: string[];

      solutions: string[];

      period: Period;
    }
  ) => void;
};

/* ========================================================= */

export default function DigestEngine({
  query,

  setQuery,

  selectedTopics,

  setSelectedTopics,

  selectedCompanies,

  setSelectedCompanies,

  selectedSolutions,

  setSelectedSolutions,

  onSearch,
}: Props) {

  /* =======================================================
     OPTIONS
  ======================================================= */

  const [
    topicOptions,
    setTopicOptions,
  ] = useState<
    SelectOption[]
  >([]);

  const [
    companyOptions,
    setCompanyOptions,
  ] = useState<
    SelectOption[]
  >([]);

  const [
    solutionOptions,
    setSolutionOptions,
  ] = useState<
    SelectOption[]
  >([]);

  /* =======================================================
     UI
  ======================================================= */

  const [
    period,
    setPeriod,
  ] = useState<Period>(
    "total"
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     LOAD REFERENTIALS
  ======================================================= */

  useEffect(() => {

    async function loadReferentials() {

      try {

        const topicsRes =
          await api.get(
            "/topic/list"
          );

        const companiesRes =
          await api.get(
            "/company/list"
          );

        const solutionsRes =
          await api.get(
            "/solution/list"
          );

        /* =================================================
           NORMALIZATION
        ================================================= */

        const topicsRaw =
          Array.isArray(
            topicsRes
          )
            ? topicsRes
            : topicsRes
                ?.result
                ?.topics ||
              topicsRes
                ?.topics ||
              topicsRes
                ?.result ||
              [];

        const companiesRaw =
          Array.isArray(
            companiesRes
          )
            ? companiesRes
            : companiesRes
                ?.result
                ?.companies ||
              companiesRes
                ?.companies ||
              companiesRes
                ?.result ||
              [];

        const solutionsRaw =
          Array.isArray(
            solutionsRes
          )
            ? solutionsRes
            : solutionsRes
                ?.result
                ?.solutions ||
              solutionsRes
                ?.solutions ||
              solutionsRes
                ?.result ||
              [];

        /* =================================================
           OPTIONS
        ================================================= */

        setTopicOptions(
          topicsRaw.map(
            (
              x: any
            ) => ({
              id:
                x.ID_TOPIC ??
                x.id_topic ??
                x.id,

              label:
                x.LABEL ??
                x.label ??
                x.name,
            })
          )
        );

        setCompanyOptions(
          companiesRaw.map(
            (
              x: any
            ) => ({
              id:
                x.ID_COMPANY ??
                x.id_company ??
                x.id,

              label:
                x.NAME ??
                x.name,
            })
          )
        );

        setSolutionOptions(
          solutionsRaw.map(
            (
              x: any
            ) => ({
              id:
                x.ID_SOLUTION ??
                x.id_solution ??
                x.id,

              label:
                x.NAME ??
                x.name,
            })
          )
        );

      } catch (
        e
      ) {

        console.error(
          "Erreur chargement référentiels Digest",
          e
        );
      }
    }

    loadReferentials();

  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  async function handleSearch() {

    setLoading(true);

    try {

      await onSearch({
        query,

        topics:
          selectedTopics.map(
            (t) => t.id
          ),

        companies:
          selectedCompanies.map(
            (c) => c.id
          ),

        solutions:
          selectedSolutions.map(
            (s) => s.id
          ),

        period,
      });

    } finally {

      setLoading(
        false
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="bg-white border border-gray-200 rounded-lg px-4 py-4 space-y-4">

      {/* ===================================================
         HEADER
      =================================================== */}

      <div className="flex items-center justify-between">

        <h2 className="text-sm font-semibold tracking-tight">
          Moteur éditorial
        </h2>

      </div>

      {/* ===================================================
         QUERY
      =================================================== */}

      <div>

        <input
          type="text"

          value={query}

          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }

          placeholder="Recherche libre Curator..."

          className="
            w-full
            h-10
            border border-gray-300
            rounded-lg
            px-3
            text-sm
          "
        />

      </div>

      {/* ===================================================
         FILTERS
      =================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">

        {/* TOPICS */}

        <SearchableMultiSelect
          label="Topics"

          options={
            topicOptions
          }

          values={
            selectedTopics
          }

          onChange={
            setSelectedTopics
          }
        />

        {/* COMPANIES */}

        <SearchableMultiSelect
          label="Sociétés"

          options={
            companyOptions
          }

          values={
            selectedCompanies
          }

          onChange={
            setSelectedCompanies
          }
        />

        {/* SOLUTIONS */}

        <SearchableMultiSelect
          label="Solutions"

          options={
            solutionOptions
          }

          values={
            selectedSolutions
          }

          onChange={
            setSelectedSolutions
          }
        />

      </div>

      {/* ===================================================
         FOOTER
      =================================================== */}

      <div className="flex items-center justify-between">

        {/* PERIOD */}

        <div className="flex gap-1">

          {(
            [
              "7d",
              "30d",
              "total",
            ] as Period[]
          ).map(
            (p) => (

              <button
                key={p}

                onClick={() =>
                  setPeriod(
                    p
                  )
                }

                className={`
                  h-8 px-3 rounded text-xs transition
                  ${
                    period === p
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {p === "7d"
                  ? "7j"
                  : p ===
                    "30d"
                  ? "30j"
                  : "Tout"}

              </button>
            )
          )}

        </div>

        {/* SEARCH */}

        <button
          onClick={
            handleSearch
          }

          disabled={
            loading
          }

          className="
            h-9 px-4 rounded-lg
            bg-black text-white
            text-sm font-medium
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
  );
}
