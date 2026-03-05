"use client";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import ConceptSelector from "@/components/admin/ConceptSelector";
import SolutionSelector from "@/components/admin/SolutionSelector";

type Props = {
  topicsRaw: string[];
  acteursRaw: string[];
  conceptsRaw: string[];
  solutionsRaw: string[];

  topics: string[];
  companies: string[];
  concepts: string[];
  solutions: string[];

  onChange: (data: any) => void;
  onSave: () => void;
  onPublish?: () => void;
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
  onPublish,
}: Props) {

  function BadgeList({ items }: { items: string[] }) {

    if (!items?.length) {
      return (
        <div className="text-xs text-gray-400">
          Aucun élément proposé
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-xs bg-gray-100 border rounded px-2 py-1"
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (

    <div className="space-y-8">

      {/* ================= RAW ================= */}

      <div className="space-y-4">

        <h3 className="text-sm font-semibold text-gray-700">
          Propositions LLM
        </h3>

        <div className="space-y-3">

          <div>
            <div className="text-xs font-medium mb-1">
              Topics suggérés
            </div>
            <BadgeList items={topicsRaw} />
          </div>

          <div>
            <div className="text-xs font-medium mb-1">
              Acteurs cités
            </div>
            <BadgeList items={acteursRaw} />
          </div>

          <div>
            <div className="text-xs font-medium mb-1">
              Concepts
            </div>
            <BadgeList items={conceptsRaw} />
          </div>

          <div>
            <div className="text-xs font-medium mb-1">
              Solutions
            </div>
            <BadgeList items={solutionsRaw} />
          </div>

        </div>

      </div>

      {/* ================= VALIDATION ================= */}

      <div className="space-y-6 border-t pt-6">

        <h3 className="text-sm font-semibold text-gray-700">
          Validation structurante
        </h3>

        <TopicSelector
          values={topics}
          onChange={(vals) => onChange({ topics: vals })}
        />

        <CompanySelector
          values={companies}
          onChange={(vals) => onChange({ companies: vals })}
        />

        <ConceptSelector
          values={concepts}
          topicIds={topics}
          onChange={(vals) => onChange({ concepts: vals })}
        />

        <SolutionSelector
          values={solutions}
          onChange={(vals) => onChange({ solutions: vals })}
        />

        <button
          onClick={onSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sauvegarder validation
        </button>

        {onPublish && (
          <button
            onClick={onPublish}
            className="w-full px-4 py-2 bg-green-600 text-white rounded"
          >
            Publier
          </button>
        )}

      </div>

    </div>

  );
}
