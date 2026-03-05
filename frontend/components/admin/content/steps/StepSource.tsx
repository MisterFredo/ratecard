"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import SolutionSelector from "@/components/admin/SolutionSelector";
import ConceptSelector, {
  Concept,
} from "@/components/admin/ConceptSelector";

type Source = {
  SOURCE_ID: string;
  NAME: string;
};

type Props = {
  onSubmit: (data: {
    source_id: string;
    text: string;
    topics: any[];
    companies: any[];
    solutions: any[];
    concepts: Concept[];
  }) => void;
};

export default function StepSource({ onSubmit }: Props) {

  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState<string>("");

  const [sourceText, setSourceText] = useState("");

  // Champs gouvernés (optionnels)
  const [topics, setTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);

  const charCount = sourceText.length;

  const isValid =
    sourceText.trim().length >= 80 && sourceId;

  // ==========================================================
  // LOAD SOURCES
  // ==========================================================

  useEffect(() => {

    async function loadSources() {

      try {

        const res = await api.get("/source/list");
        const list = res.sources || [];

        setSources(list);

        if (list.length) {
          setSourceId(list[0].SOURCE_ID);
        }

      } catch (e) {

        console.error(e);
        alert("Impossible de charger les sources");

      }

    }

    loadSources();

  }, []);

  // ==========================================================
  // VALIDATE
  // ==========================================================

  function validate() {

    if (!sourceText.trim()) {
      alert("Merci de fournir une source.");
      return;
    }

    if (sourceText.trim().length < 80) {
      alert("La source semble trop courte.");
      return;
    }

    if (!sourceId) {
      alert("Merci de sélectionner une source.");
      return;
    }

    onSubmit({
      source_id: sourceId,
      text: sourceText.trim(),
      topics,
      companies,
      solutions,
      concepts,
    });

  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-8">

      {/* SOURCE SELECTOR */}

      <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

        <div className="flex-1 space-y-1">

          <label className="text-sm font-medium">
            Source
          </label>

          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="border rounded p-2 w-full"
          >
            {sources.map((s) => (
              <option
                key={s.SOURCE_ID}
                value={s.SOURCE_ID}
              >
                {s.NAME}
              </option>
            ))}
          </select>

        </div>

        <div className="text-xs text-gray-500 md:mb-2">
          {charCount} caractères
        </div>

      </div>

      {/* SOURCE TEXT */}

      <div className="space-y-1">

        <label className="text-sm font-medium">
          Source brute
        </label>

        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-3 w-full h-44"
          placeholder="Collez ici le texte source à synthétiser..."
        />

        <p className="text-xs text-gray-500">
          Le résumé sera strictement basé sur ce texte.
        </p>

      </div>

      {/* TAGS FORTS (OPTIONNELS) */}

      <div className="space-y-6 border-t pt-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Tags forts (optionnel)
        </h3>

        {/* Ligne 1 : Topics + Concepts */}
        <div className="grid gap-6 md:grid-cols-2">

          <TopicSelector
            values={topics}
            onChange={setTopics}
          />

          <ConceptSelector
            values={concepts}
            topicIds={topics
              .map((t) => t?.id_topic)
              .filter(Boolean)
            }
            onChange={setConcepts}
          />

        </div>

        {/* Ligne 2 : Companies + Solutions */}
        <div className="grid gap-6 md:grid-cols-2">

          <CompanySelector
            values={companies}
            onChange={setCompanies}
          />

          <SolutionSelector
            values={solutions}
            onChange={setSolutions}
          />

        </div>

        <p className="text-xs text-gray-500">
          Ces éléments sont facultatifs. Ils permettent de guider la
          gouvernance et la future vectorisation.
        </p>

      </div>

      {/* ACTION */}

      <div>

        <button
          onClick={validate}
          disabled={!isValid}
          className={`px-5 py-2 rounded font-medium text-white ${
            isValid
              ? "bg-ratecard-blue"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Valider la source
        </button>

      </div>

    </div>

  );

}
