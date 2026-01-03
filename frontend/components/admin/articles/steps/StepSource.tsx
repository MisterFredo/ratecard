"use client";

import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";

type Props = {
  useSource: boolean | null;
  onChooseManual: () => void;
  onChooseSource: () => void;
  onApplyDraft: (draft: {
    title?: string;
    excerpt?: string;
    content_html?: string;
  }) => void;
};

export default function StepSource({
  useSource,
  onChooseManual,
  onChooseSource,
  onApplyDraft,
}: Props) {
  return (
    <div className="space-y-4">

      <p className="text-sm text-gray-600">
        Souhaitez-vous partir d’une source existante ?
      </p>

      <div className="flex gap-4">
        <button
          onClick={onChooseManual}
          className="px-4 py-2 border rounded"
        >
          Non, écrire directement
        </button>

        <button
          onClick={onChooseSource}
          className="px-4 py-2 bg-ratecard-blue text-white rounded"
        >
          Transformer une source (assistant)
        </button>
      </div>

      {useSource && (
        <div className="mt-4">
          <ArticleSourcePanel
            onApplyDraft={onApplyDraft}
          />
        </div>
      )}
    </div>
  );
}
