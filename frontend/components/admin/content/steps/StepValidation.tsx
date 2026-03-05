"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import TopicSelector, { Topic } from "@/components/admin/TopicSelector";
import CompanySelector, { Company } from "@/components/admin/CompanySelector";
import ConceptSelector, { Concept } from "@/components/admin/ConceptSelector";
import SolutionSelector, { Solution } from "@/components/admin/SolutionSelector";

type Props = {
  topicsRaw: string[];
  acteursRaw: string[];
  conceptsRaw: string[];
  solutionsRaw: string[];

  topics: string[];
  companies: string[];
  concepts: string[];
  solutions: string[];

  onChange: (data: {
    topics?: string[];
    companies?: string[];
    concepts?: string[];
    solutions?: string[];
  }) => void;

  onSave: () => void;
};

export default function StepValidation({
  topicsRaw,
  acteursRaw,
  conceptsRaw,
  solutionsRaw,
  topics,
  companies,
  concepts,
  solutions,
  onChange,
  onSave,
}: Props) {

  // =========================
  // Load governed data
  // =========================

  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allConcepts, setAllConcepts] = useState<Concept[]>([]);
  const [allSolutions, setAllSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    async function load() {
      const [
        topicRes,
        companyRes,
        conceptRes,
        solutionRes,
      ] = await Promise.all([
        api.get("/topic/list"),
        api.get("/company/list"),
        api.get("/concept/list"),
        api.get("/solution/list"),
      ]);

      setAllTopics(topicRes.topics || []);
      setAllCompanies(companyRes.companies || []);
      setAllConcepts(conceptRes.concepts || []);
      setAllSolutions(solutionRes.solutions || []);
    }

    load();
  }, []);

  // =========================
  // Mapping IDs → Objects
  // =========================

  const selectedTopics = allTopics.filter((t) =>
    topics.includes(t.ID_TOPIC)
  );

  const selectedCompanies = allCompanies.filter((c) =>
    companies.includes(c.ID_COMPANY)
  );

  const selectedConcepts = allConcepts.filter((c) =>
    concepts.includes(c.ID_CONCEPT)
  );

  const selectedSolutions = allSolutions.filter((s) =>
    solutions.includes(s.ID_SOLUTION)
  );

  // =========================
  // Render
  // =========================

  return (

    <div className="space-y-8">

      <div className="text-sm font-semibold text-gray-700">
        Validation structurante
      </div>

      {/* ================= RAW DISPLAY ================= */}

      <div className="space-y-4 text-xs text-gray-500">

        {topicsRaw.length > 0 && (
          <div>
            <strong>Topics LLM :</strong>{" "}
            {topicsRaw.join(", ")}
          </div>
        )}

        {acteursRaw.length > 0 && (
          <div>
            <strong>Acteurs LLM :</strong>{" "}
            {acteursRaw.join(", ")}
          </div>
        )}

        {conceptsRaw.length > 0 && (
          <div>
            <strong>Concepts LLM :</strong>{" "}
            {conceptsRaw.join(", ")}
          </div>
        )}

        {solutionsRaw.length > 0 && (
          <div>
            <strong>Solutions LLM :</strong>{" "}
            {solutionsRaw.join(", ")}
          </div>
        )}

      </div>

      {/* ================= SELECTORS ================= */}

      <TopicSelector
        values={selectedTopics}
        onChange={(vals) =>
          onChange({
            topics: vals.map((v) => v.ID_TOPIC),
          })
        }
      />

      <CompanySelector
        values={selectedCompanies}
        onChange={(vals) =>
          onChange({
            companies: vals.map((v) => v.ID_COMPANY),
          })
        }
      />

      <ConceptSelector
        values={selectedConcepts}
        onChange={(vals) =>
          onChange({
            concepts: vals.map((v) => v.ID_CONCEPT),
          })
        }
      />

      <SolutionSelector
        values={selectedSolutions}
        onChange={(vals) =>
          onChange({
            solutions: vals.map((v) => v.ID_SOLUTION),
          })
        }
      />

      {/* ================= SAVE ================= */}

      <button
        onClick={onSave}
        className="w-full px-4 py-2 bg-black text-white rounded text-sm"
      >
        Sauvegarder la validation
      </button>

    </div>
  );
}
