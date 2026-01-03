"use client";

import ArticleContextBlock from "@/components/admin/articles/ArticleContextBlock";

type Props = {
  topics: any[];
  companies: any[];
  persons: any[];
  contextValidated: boolean;
  onChange: (data: {
    topics?: any[];
    companies?: any[];
    persons?: any[];
  }) => void;
  onValidate: () => void;
};

export default function StepContext({
  topics,
  companies,
  persons,
  contextValidated,
  onChange,
  onValidate,
}: Props) {
  return (
    <div className="space-y-4">
      <ArticleContextBlock
        topics={topics}
        companies={companies}
        persons={persons}
        onChange={onChange}
      />

      {!contextValidated && (
        <button
          onClick={onValidate}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Valider le contexte
        </button>
      )}
    </div>
  );
}
