"use client";

import HtmlEditor from "@/components/admin/HtmlEditor";

type Props = {
  excerpt: string;
  concept: string;
  contentBody: string;
  onChange: (data: {
    excerpt?: string;
    concept?: string;
    contentBody?: string;
  }) => void;
};

export default function ContentContentBlock({
  excerpt,
  concept,
  contentBody,
  onChange,
}: Props) {
  return (
    <div className="space-y-4">
      {/* EXCERPT */}
      <div>
        <label className="text-sm font-medium">
          Accroche (excerpt)
        </label>
        <textarea
          className="border rounded p-2 w-full h-20"
          value={excerpt}
          onChange={(e) => onChange({ excerpt: e.target.value })}
          placeholder="Accroche courte, utilisée sur le site et la newsletter"
        />
      </div>

      {/* CONCEPT */}
      <div>
        <label className="text-sm font-medium">
          Concept central
        </label>
        <textarea
          className="border rounded p-2 w-full h-16"
          value={concept}
          onChange={(e) => onChange({ concept: e.target.value })}
          placeholder="Phrase unique résumant l’enjeu"
        />
      </div>

      {/* CONTENT BODY */}
      <div>
        <label className="text-sm font-medium">
          Développement
        </label>
        <HtmlEditor
          value={contentBody}
          onChange={(v) => onChange({ contentBody: v })}
        />
      </div>
    </div>
  );
}
