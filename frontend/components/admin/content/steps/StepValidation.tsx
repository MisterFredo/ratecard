"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import MultiSelectTopics from "@/components/admin/content/steps/MultiSelectTopics";
import CompanySelector, { Company } from "@/components/admin/CompanySelector";
import ConceptSelector, { Concept } from "@/components/admin/ConceptSelector";
import SolutionSelector, { Solution } from "@/components/admin/SolutionSelector";

type TopicRef = {
  ID_TOPIC: string;
  LABEL: string;
};

type Props = {
  topicsRaw: string[]; // IDs gouvernés
  acteursRaw: string[];
  conceptsRaw: any[];  // concepts LLM structurés
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
  // Governed data
  // =========================

  const [allTopics, setAllTopics] = useState<TopicRef[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allConcepts, setAllConcepts] = useState<Concept[]>([]);
  const [allSolutions, setAllSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    async function load() {
      try {
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

        setAllTopics(topicRes?.topics || []);
        setAllCompanies(companyRes?.companies || []);
        setAllConcepts(conceptRes?.concepts || []);
        setAllSolutions(solutionRes?.solutions || []);
      } catch (e) {
        console.error("Erreur chargement validation", e);
      }
    }

    load();
  }, []);

  // =========================
  // AUTO-SELECT LLM TOPICS (once)
  // =========================

  useEffect(() => {
    if (topics.length === 0 && topicsRaw?.length > 0) {
      onChange({ topics: topicsRaw });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicsRaw]);

  // =========================
  // Mapping IDs → Objects
  // =========================

  const selectedCompanies = allCompanies.filter((c: any) =>
    companies.includes(c.ID_COMPANY)
  );

  const selectedConcepts = allConcepts.filter((c: any) =>
    concepts.includes(c.ID_CONCEPT)
  );

  const selectedSolutions = allSolutions.filter((s: any) =>
    solutions.includes(s.ID_SOLUTION)
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">

      <div className="text-sm font-semibold text-gray-700">
        Validation structurante
      </div>

      {/* ================= RAW DISPLAY ================= */}

      <div className="space-y-2 text-xs text-gray-500 border-b pb-3">

        {topicsRaw.length > 0 && (
          <div>
            <strong>Topics LLM :</strong> {topicsRaw.join(", ")}
          </div>
        )}

        {acteursRaw.length > 0 && (
          <div>
            <strong>Acteurs LLM :</strong> {acteursRaw.join(", ")}
          </div>
        )}

        {conceptsRaw.length > 0 && (
          <div>
            <strong>Concepts LLM :</strong>{" "}
            {conceptsRaw
              .map((c: any) =>
                typeof c === "string" ? c : c.label
              )
              .join(", ")}
          </div>
        )}

        {solutionsRaw.length > 0 && (
          <div>
            <strong>Solutions LLM :</strong> {solutionsRaw.join(", ")}
          </div>
        )}

      </div>

      {/* ================= TOPICS ================= */}

      <MultiSelectTopics
        topics={allTopics}
        selected={topics}
        onChange={(ids: string[]) =>
          onChange({ topics: ids })
        }
      />

      {/* ================= COMPANIES ================= */}

      <CompanySelector
        values={selectedCompanies}
        onChange={(vals) =>
          onChange({
            companies: vals.map((v) => v.id_company),
          })
        }
      />

      {/* ================= CONCEPTS ================= */}

      <ConceptSelector
        values={selectedConcepts}
        topicIds={topics}
        onChange={(vals) =>
          onChange({
            concepts: vals.map((v) => v.id_concept),
          })
        }
      />

      {/* ================= SOLUTIONS ================= */}

      <SolutionSelector
        values={selectedSolutions}
        onChange={(vals) =>
          onChange({
            solutions: vals.map((v) => v.id_solution),
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
