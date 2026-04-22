"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import MatchingTable from "@/components/admin/matching/MatchingTable";


type LLMItem = {
  value: string;
  count: number;
  type_hint?: "company" | "solution" | "unknown";
  suggested_id?: string | null;
  suggested_label?: string | null;
};

type Solution = {
  id_solution: string;
  name: string;
};

type Company = {
  id_company: string;
  name: string;
};


export default function MatchingPage() {

  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"solutions" | "companies">("solutions");

  const [llmSolutions, setLLMSolutions] = useState<LLMItem[]>([]);
  const [llmCompanies, setLLMCompanies] = useState<LLMItem[]>([]);

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [selected, setSelected] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});


  /* ---------------------------------------------------------
     LOAD DATA
  --------------------------------------------------------- */

  useEffect(() => {

    async function load() {

      try {

        const [
          llmSolRes,
          llmCompRes,
          solRes,
          compRes
        ] = await Promise.all([
          api.get("/matching/solutions"),
          api.get("/matching/companies"),
          api.get("/solution/list"),
          api.get("/company/list")
        ]);

        setLLMSolutions(llmSolRes.solutions || []);
        setLLMCompanies(llmCompRes.companies || []);

        setSolutions(solRes.solutions || []);
        setCompanies(compRes.companies || []);

      } catch (e) {

        console.error("Erreur chargement matching", e);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);


  /* ---------------------------------------------------------
     AUTO SELECT (🔥 clé UX)
  --------------------------------------------------------- */

  useEffect(() => {

    const auto: any = {};

    const data = tab === "solutions" ? llmSolutions : llmCompanies;

    data.forEach((i) => {
      if (i.suggested_id) {
        auto[i.value] = i.suggested_id;
      }
    });

    setSelected(auto);

  }, [llmSolutions, llmCompanies, tab]);


  /* ---------------------------------------------------------
     MATCH
  --------------------------------------------------------- */

  async function applyMatch(value: string) {

    const id = selected[value];

    if (!id) {
      alert("Sélectionner une valeur");
      return;
    }

    try {

      setProcessing(value);

      if (tab === "solutions") {

        await api.post("/matching/solutions/match", {
          alias: value,
          id_solution: id,
          action: "MATCH"
        });

        setLLMSolutions(prev => prev.filter(v => v.value !== value));

      } else {

        await api.post("/matching/companies/match", {
          alias: value,
          id_company: id,
          action: "MATCH"
        });

        setLLMCompanies(prev => prev.filter(v => v.value !== value));

      }

    } catch (e) {

      console.error(e);
      alert("Erreur matching");

    } finally {

      setProcessing(null);

    }

  }


  /* ---------------------------------------------------------
     IGNORE
  --------------------------------------------------------- */

  async function ignore(value: string) {

    try {

      setProcessing(value);

      if (tab === "solutions") {

        await api.post("/matching/solutions/match", {
          alias: value,
          action: "IGNORE"
        });

        setLLMSolutions(prev => prev.filter(v => v.value !== value));

      } else {

        await api.post("/matching/companies/match", {
          alias: value,
          action: "IGNORE"
        });

        setLLMCompanies(prev => prev.filter(v => v.value !== value));

      }

    } catch (e) {

      console.error(e);
      alert("Erreur ignore");

    } finally {

      setProcessing(null);

    }

  }


  /* ---------------------------------------------------------
     BULK IGNORE
  --------------------------------------------------------- */

  async function ignoreBulk() {

    const values = Object.keys(checked).filter(k => checked[k]);

    if (values.length === 0) {
      alert("Aucune sélection");
      return;
    }

    try {

      setProcessing("bulk");

      for (const value of values) {

        if (tab === "solutions") {

          await api.post("/matching/solutions/match", {
            alias: value,
            action: "IGNORE"
          });

        } else {

          await api.post("/matching/companies/match", {
            alias: value,
            action: "IGNORE"
          });

        }

      }

      if (tab === "solutions") {
        setLLMSolutions(prev =>
          prev.filter(v => !values.includes(v.value))
        );
      } else {
        setLLMCompanies(prev =>
          prev.filter(v => !values.includes(v.value))
        );
      }

      setChecked({});

    } catch (e) {

      console.error(e);
      alert("Erreur ignore bulk");

    } finally {

      setProcessing(null);

    }

  }


  /* ---------------------------------------------------------
     BULK MATCH (🔥 nouveau)
  --------------------------------------------------------- */

  async function matchBulk() {

    const values = Object.keys(checked).filter(k => checked[k]);

    if (values.length === 0) {
      alert("Aucune sélection");
      return;
    }

    try {

      setProcessing("bulk");

      for (const value of values) {

        const id = selected[value];
        if (!id) continue;

        await applyMatch(value);

      }

      setChecked({});

    } catch (e) {

      console.error(e);
      alert("Erreur match bulk");

    } finally {

      setProcessing(null);

    }

  }


  /* ---------------------------------------------------------
     CURRENT DATA
  --------------------------------------------------------- */

  const items = tab === "solutions" ? llmSolutions : llmCompanies;
  const list = tab === "solutions" ? solutions : companies;


  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  if (loading) return <p>Chargement…</p>;


  return (

    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">
        Matching LLM
      </h1>


      {/* ---------------------------------- */}
      {/* TABS */}
      {/* ---------------------------------- */}

      <div className="flex gap-4">

        <button
          onClick={() => setTab("solutions")}
          className={`px-4 py-2 rounded ${
            tab === "solutions"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Solutions
        </button>

        <button
          onClick={() => setTab("companies")}
          className={`px-4 py-2 rounded ${
            tab === "companies"
              ? "bg-ratecard-blue text-white"
              : "bg-gray-200"
          }`}
        >
          Sociétés
        </button>

      </div>


      {/* ---------------------------------- */}
      {/* BULK ACTION */}
      {/* ---------------------------------- */}

      <div className="flex gap-2">

        <button
          onClick={matchBulk}
          disabled={processing === "bulk"}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          MATCH sélection
        </button>

        <button
          onClick={ignoreBulk}
          disabled={processing === "bulk"}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          IGNORE sélection
        </button>

      </div>


      {/* ---------------------------------- */}
      {/* TABLE */}
      {/* ---------------------------------- */}

      <MatchingTable
        items={items}
        list={list}
        tab={tab}
        selected={selected}
        setSelected={setSelected}
        checked={checked}
        setChecked={setChecked}
        processing={processing}
        applyMatch={applyMatch}
        ignore={ignore}
      />

    </div>

  );

}
