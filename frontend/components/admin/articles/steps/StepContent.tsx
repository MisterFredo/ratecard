"use client";

import ArticleContentBlock from "@/components/admin/articles/ArticleContentBlock";

type Props = {
  title: string;
  excerpt: string;
  contentHtml: string;
  outro: string;

  onChange: (data: {
    title?: string;
    excerpt?: string;
    contentHtml?: string;
    outro?: string;
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

export default function StepContent({
  title,
  excerpt,
  contentHtml,
  outro,
  onChange,
  onValidate,
  saving,
}: Props) {
  return (
    <div className="space-y-4">
      <ArticleContentBlock
        title={title}
        excerpt={excerpt}
        contentHtml={contentHtml}
        onChange={(d) => {
          if (d.title !== undefined) onChange({ title: d.title });
          if (d.excerpt !== undefined) onChange({ excerpt: d.excerpt });
          if (d.contentHtml !== undefined)
            onChange({ contentHtml: d.contentHtml });
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Ce qu’il faut retenir
        </label>
        <textarea
          className="border rounded p-2 w-full"
          value={outro}
          onChange={(e) => onChange({ outro: e.target.value })}
        />
      </div>

      <button
        onClick={onValidate}
        disabled={saving}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        {saving ? "Enregistrement…" : "Valider le contenu"}
      </button>
    </div>
  );
}
