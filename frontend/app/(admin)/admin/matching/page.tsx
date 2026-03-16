"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type LLMSolution = {
  value: string;
  count: number;
};

type Solution = {
  id_solution: string;
  name: string;
};

export default function MatchingPage() {

  const [loading, setLoading] = useState(true);

  const [llmSolutions, setLLMSolutions] = useState<LLMSolution[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);

  const [selected, setSelected] = useState<{[key:string]: string}>({});
  const [processing, setProcessing] = useState<string | null>(null);

  /* ---------------------------------------------------------
     LOAD DATA
  --------------------------------------------------------- */

  useEffect(() => {

    async function load() {

      try {

        const [llmRes, solRes] = await Promise.all([
          api.get("/matching/solutions"),
          api.get("/solution/list")
        ]);

        setLLMSolutions(llmRes.solutions || []);
        setSolutions(solRes.solutions || []);

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

    const idSolution = selected[value];

    if (!idSolution) {
      alert("Sélectionner une solution");
      return;
    }

    try {

      setProcessing(value);

      await api.post("/matching/solutions/match", {
        alias: value,
        id_solution: idSolution,
        action: "MATCH"
      });

      setLLMSolutions(prev => prev.filter(v => v.value !== value));

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

      await api.post("/matching/solutions/match", {
        alias: value,
        action: "IGNORE"
      });

      setLLMSolutions(prev => prev.filter(v => v.value !== value));

    } catch (e) {

      console.error(e);
      alert("Erreur ignore");

    } finally {

      setProcessing(null);

    }

  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  if (loading) return <p>Chargement…</p>;

  return (

    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">
        Matching des solutions LLM
      </h1>

      <div className="border rounded overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Valeur LLM</th>
              <th className="p-3">Nb contenus</th>
              <th className="p-3">Solution</th>
              <th className="p-3 w-40 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>

            {llmSolutions.map((s) => (

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
                      Sélectionner solution
                    </option>

                    {solutions.map(sol => (
                      <option
                        key={sol.id_solution}
                        value={sol.id_solution}
                      >
                        {sol.name}
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

            {llmSolutions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
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
