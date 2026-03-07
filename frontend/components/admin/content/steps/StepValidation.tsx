"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import MultiSelectTopics, {
  Topic,
} from "@/components/admin/content/steps/MultiSelectTopics";

import CompanySelector, {
  Company,
} from "@/components/admin/CompanySelector";

import ConceptSelector, {
  Concept,
} from "@/components/admin/ConceptSelector";

import SolutionSelector, {
  Solution,
} from "@/components/admin/SolutionSelector";

type Props = {
  topicsRaw: any[];
  acteursRaw: string[];
  conceptsRaw: any[];
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

  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allConcepts, setAllConcepts] = useState<Concept[]>([]);
  const [allSolutions, setAllSolutions] = useState<Solution[]>([]);

  // ============================================================
  // LOAD + NORMALIZE API DATA
  // ============================================================

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

        // 🔥 TOPICS (snake / old format compatible)
        setAllTopics(
          (topicRes?.topics || []).map((t: any) => ({
            ID_TOPIC: t.ID_TOPIC ?? t.id_topic,
            LABEL: t.LABEL ?? t.label,
          }))
        );

        // 🔥 COMPANIES
        setAllCompanies(
          (companyRes?.companies || []).map((c: any) => ({
            id_company: c.id_company ?? c.ID_COMPANY,
            name: c.name ?? c.NAME,
          }))
        );

        // 🔥 CONCEPTS
        setAllConcepts(
          (conceptRes?.concepts || []).map((c: any) => ({
            id_concept: c.id_concept ?? c.ID_CONCEPT,
            title: c.title ?? c.TITLE,
          }))
        );

        // 🔥 SOLUTIONS
        setAllSolutions(
          (solutionRes?.solutions || []).map((s: any) => ({
            id_solution: s.id_solution ?? s.ID_SOLUTION,
            name: s.name ?? s.NAME,
          }))
        );

      } catch (e) {
        console.error("Erreur chargement validation", e);
      }
    }

    load();

  }, []);

  // ============================================================
  // AUTO-INJECT LLM TOPICS (ONCE, SAFE FORMAT)
  // ============================================================

  const [autoInjected, setAutoInjected] = useState(false);

  useEffect(() => {

    if (!autoInjected && topicsRaw?.length > 0) {

      const normalized = topicsRaw.map((t: any) =>
        typeof t === "string"
          ? t
          : t.id_topic ?? t.ID_TOPIC
      );

      onChange({ topics: normalized });
      setAutoInjected(true);
    }

  }, [topicsRaw, autoInjected, onChange]);

  // ============================================================
  // MAPPING IDS → OBJECTS
  // ============================================================

  const selectedCompanies = allCompanies.filter((c) =>
    companies.includes(c.id_company)
  );

  const selectedConcepts = allConcepts.filter((c) =>
    concepts.includes(c.id_concept)
  );

  const selectedSolutions = allSolutions.filter((s) =>
    solutions.includes(s.id_solution)
  );

  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="space-y-6">

      <div className="text-sm font-semibold text-gray-700">
        Validation structurante
      </div>

      {/* RAW DISPLAY */}

      <div className="space-y-2 text-xs text-gray-500 border-b pb-3">

        {topicsRaw?.length > 0 && (
          <div>
            <strong>Topics LLM :</strong>{" "}
            {topicsRaw
              .map((t: any) =>
                typeof t === "string"
                  ? t
                  : t.label ?? t.LABEL
              )
              .join(", ")}
          </div>
        )}

        {acteursRaw?.length > 0 && (
          <div>
            <strong>Acteurs LLM :</strong> {acteursRaw.join(", ")}
          </div>
        )}

        {conceptsRaw?.length > 0 && (
          <div>
            <strong>Concepts LLM :</strong>{" "}
            {conceptsRaw
              .map((c: any) =>
                typeof c === "string"
                  ? c
                  : c.label ?? c.LABEL
              )
              .join(", ")}
          </div>
        )}

        {solutionsRaw?.length > 0 && (
          <div>
            <strong>Solutions LLM :</strong> {solutionsRaw.join(", ")}
          </div>
        )}

      </div>

      {/* TOPICS */}

      <MultiSelectTopics
        topics={allTopics}
        selected={topics}
        onChange={(ids: string[]) =>
          onChange({ topics: ids })
        }
      />

      {/* COMPANIES */}

      <CompanySelector
        values={selectedCompanies}
        onChange={(vals) =>
          onChange({
            companies: vals.map((v) => v.id_company),
          })
        }
      />

      {/* CONCEPTS */}

      <ConceptSelector
        values={selectedConcepts}
        topicIds={topics}
        onChange={(vals) =>
          onChange({
            concepts: vals.map((v) => v.id_concept),
          })
        }
      />

      {/* SOLUTIONS */}

      <SolutionSelector
        values={selectedSolutions}
        onChange={(vals) =>
          onChange({
            solutions: vals.map((v) => v.id_solution),
          })
        }
      />

      {/* SAVE */}

      <button
        onClick={onSave}
        className="w-full px-4 py-2 bg-black text-white rounded text-sm"
        type="button"
      >
        Sauvegarder la validation
      </button>

    </div>

  );

}
