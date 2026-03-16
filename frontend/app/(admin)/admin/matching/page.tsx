"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";


type LLMItem = {
  value: string;
  count: number;
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
      {/* TABLE */}
      {/* ---------------------------------- */}

      <div className="border rounded overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">

            <tr>

              <th className="p-3">Valeur LLM</th>
              <th className="p-3">Nb contenus</th>
              <th className="p-3">
                {tab === "solutions" ? "Solution" : "Société"}
              </th>
              <th className="p-3 w-40 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((s) => (

              <tr key={s.value} className="border-t">

                <td className="p-3 font-medium">
                  {s.value}
                </td>

                <td className="p-3 text-gray-500">
                  {s.count}
                </td>

                <td className="p-3">

                  <select
                    className="border p-2 rounded w-full"
                    value={selected[s.value] || ""}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        [s.value]: e.target.value
                      })
                    }
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    {list.map((item: any) => (

                      <option
                        key={
                          tab === "solutions"
                            ? item.id_solution
                            : item.id_company
                        }
                        value={
                          tab === "solutions"
                            ? item.id_solution
                            : item.id_company
                        }
                      >
                        {item.name}
                      </option>

                    ))}

                  </select>

                </td>

                <td className="p-3 flex justify-end gap-2">

                  <button
                    onClick={() => applyMatch(s.value)}
                    disabled={processing === s.value}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    MATCH
                  </button>

                  <button
                    onClick={() => ignore(s.value)}
                    disabled={processing === s.value}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    IGNORE
                  </button>

                </td>

              </tr>

            ))}

            {items.length === 0 && (

              <tr>

                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400"
                >

                  Rien à matcher

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}
