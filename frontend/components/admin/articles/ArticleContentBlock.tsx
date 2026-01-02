"use client";

import HtmlEditor from "@/components/admin/HtmlEditor";

type Props = {
  title: string;
  excerpt: string;
  contentHtml: string;

  onChange: (data: {
    title?: string;
    excerpt?: string;
    contentHtml?: string;
  }) => void;

  onIAAction?: (action: "excerpt" | "structure" | "rewrite") => void;
};

export default function ArticleContentBlock({
  title,
  excerpt,
  contentHtml,
  onChange,
  onIAAction,
}: Props) {
  return (
    <div className="space-y-6 border rounded p-4 bg-white">

      <h2 className="text-lg font-semibold text-ratecard-blue">
        Contenu de l’article
      </h2>

      {/* ---------------------------------------
          TITRE
      ---------------------------------------- */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Titre</label>
        <input
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* ---------------------------------------
          EXCERPT
      ---------------------------------------- */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Accroche (excerpt)
          </label>

          {onIAAction && (
            <button
              onClick={() => onIAAction("excerpt")}
              className="text-xs text-ratecard-blue underline"
            >
              Proposer une accroche (IA)
            </button>
          )}
        </div>

        <textarea
          value={excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
          className="border rounded p-2 w-full h-20"
        />
      </div>

      {/* ---------------------------------------
          CONTENU PRINCIPAL
      ---------------------------------------- */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Contenu principal
          </label>

          {onIAAction && (
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => onIAAction("structure")}
                className="text-ratecard-blue underline"
              >
                Structurer le texte (IA)
              </button>

              <button
                onClick={() => onIAAction("rewrite")}
                className="text-ratecard-blue underline"
              >
                Améliorer la clarté (IA)
              </button>
            </div>
          )}
        </div>

        <HtmlEditor
          value={contentHtml}
          onChange={(html) => onChange({ contentHtml: html })}
        />
      </div>
    </div>
  );
}
