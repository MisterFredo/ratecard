// app/(admin)/admin/digest/page.tsx

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import DeliveryHeaderConfig from "@/components/delivery/core/DeliveryHeaderConfig";

import DigestEngine from "@/components/digest/DigestEngine";

import DigestSelectors from "@/components/digest/DigestSelectors";

import DigestEditorialFlow from "@/components/digest/DigestEditorialFlow";

import DigestPreviewPanel from "@/components/digest/delivery/DigestPreviewPanel";

import type {
  DigestContentItem,
  DigestNumberItem,
  DigestEditorialItem,
} from "@/types/digest";

import type {
  HeaderConfig,
} from "@/types/newsletter";

import type {
  SelectOption,
} from "@/components/ui/SearchableMultiSelect";

/* ========================================================= */

export default function DigestPage() {

  /* =======================================================
     HEADER
  ======================================================= */

  const [
    headerConfig,
    setHeaderConfig,
  ] = useState<HeaderConfig>({
    title: "Digest Curator",

    subtitle: "",

    period: "",

    headerCompany:
      undefined,

    topBarEnabled:
      true,

    topBarColor:
      "#111827",

    periodColor:
      "#111827",

    introHtml: "",
  });

  const [
    introText,
    setIntroText,
  ] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [
    selectedTopics,
    setSelectedTopics,
  ] = useState<
    SelectOption[]
  >([]);

  const [
    selectedCompanies,
    setSelectedCompanies,
  ] = useState<
    SelectOption[]
  >([]);

  const [
    selectedSolutions,
    setSelectedSolutions,
  ] = useState<
    SelectOption[]
  >([]);

  /* =======================================================
     DIGEST DATA
  ======================================================= */

  const [
    contents,
    setContents,
  ] = useState<
    DigestContentItem[]
  >([]);

  const [
    numbers,
  ] = useState<
    DigestNumberItem[]
  >([]);

  /* =======================================================
     FLOW
  ======================================================= */

  const [
    editorialOrder,
    setEditorialOrder,
  ] = useState<
    DigestEditorialItem[]
  >([]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    handleSearch({
      query: "",

      topics: [],

      companies: [],

      solutions: [],

      period: "total",
    });

  }, []);

  /* =======================================================
     SEARCH API
  ======================================================= */

  async function handleSearch({
    query,

    topics,

    companies,

    solutions,

    period,
  }: {
    query: string;

    topics: string[];

    companies: string[];

    solutions: string[];

    period: string;
  }) {

    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/digest/search",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              query,

              topics,

              companies,

              solutions,

              period,

              limit: 20,

              content_type:
                "analysis",
            }),
          }
        );

      const data =
        await response.json();

      const results =
        data?.result
          ?.contents || [];

      setContents(
        results
      );

    } catch (
      error
    ) {

      console.error(
        "Digest search error",
        error
      );

    } finally {

      setLoading(false);
    }
  }

  /* =======================================================
     CONTENTS SELECTED
  ======================================================= */

  const selectedContents =
    useMemo(() => {

      const selectedIds =
        editorialOrder
          .filter(
            (i) =>
              i.type ===
              "content"
          )
          .map(
            (i) => i.id
          );

      return contents.filter(
        (c) =>
          selectedIds.includes(
            c.id
          )
      );

    }, [
      contents,
      editorialOrder,
    ]);

  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="space-y-4">

      {/* ===================================================
         HEADER
      =================================================== */}

      <div className="flex items-center justify-between">

        <h1 className="text-lg font-semibold tracking-tight">
          Digest
        </h1>

      </div>

      {/* ===================================================
         ENGINE
      =================================================== */}

      <DigestEngine
        query={query}
        setQuery={setQuery}

        selectedTopics={
          selectedTopics
        }

        setSelectedTopics={
          setSelectedTopics
        }

        selectedCompanies={
          selectedCompanies
        }

        setSelectedCompanies={
          setSelectedCompanies
        }

        selectedSolutions={
          selectedSolutions
        }

        setSelectedSolutions={
          setSelectedSolutions
        }

        onSearch={
          handleSearch
        }
      />

      {/* ===================================================
         LAYOUT
      =================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.3fr] gap-6 items-start">

        {/* =================================================
           LEFT
        ================================================= */}

        <div className="space-y-5">

          <DeliveryHeaderConfig
            headerConfig={
              headerConfig
            }

            setHeaderConfig={
              setHeaderConfig
            }

            introText={
              introText
            }

            setIntroText={
              setIntroText
            }
          />

          <DigestSelectors
            contents={
              contents
            }

            numbers={
              numbers
            }

            editorialOrder={
              editorialOrder
            }

            setEditorialOrder={
              setEditorialOrder
            }
          />

          <DigestEditorialFlow
            contents={
              contents
            }

            numbers={
              numbers
            }

            editorialOrder={
              editorialOrder
            }

            setEditorialOrder={
              setEditorialOrder
            }
          />

        </div>

        {/* =================================================
           RIGHT
        ================================================= */}

        <div className="sticky top-6 h-[calc(100vh-4rem)] overflow-y-auto pr-2">

          <DigestPreviewPanel
            headerConfig={
              headerConfig
            }

            editorialHtml={
              introText
            }

            contents={
              selectedContents
            }

            numbers={
              numbers
            }
          />

        </div>

      </div>

      {/* ===================================================
         LOADING
      =================================================== */}

      {loading && (

        <div className="fixed bottom-4 right-4 bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg">

          Chargement Digest...

        </div>

      )}

    </div>
  );
}
