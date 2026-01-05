"use client";

import { useState } from "react";

type SourceType =
  | "LINKEDIN_POST"
  | "PRESS_RELEASE"
  | "ARTICLE"
  | "INTERVIEW"
  | "OTHER";

type Props = {
  onSubmit: (data: {
    source_type: SourceType;
    source_text: string;
  }) => void;
};

export default function ContentSourcePanel({ onSubmit }: Props) {
  const [sourceType, setSourceType] =
    useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!sourceText.trim()) {
      setError("Merci de coller une source à analyser.");
      return;
    }

    setError(null);
    onSubmit({
      source_type: sourceType,
      source_text: sourceText,
    });
  }

  return (
    <div className="space-y-4 border rounded p-4 bg-white">
      <h2 className="text-lg font-semibold text-ratecard-blue">
        Source
      </h2>

      {/* TYPE SOURCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Type de source
        </label>
        <select
          value={sourceType}
          onChange={(e) =>
            setSourceType(e.target.value as SourceType)
          }
          className="border rounded p-2 w-full"
        >
          <option value="LINKEDIN_POST">Post LinkedIn</option>
          <option value="PRESS_RELEASE">Communiqué / Blog</option>
          <option value="ARTICLE">Article</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OTHER">Autre</option>
        </select>
      </div>

      {/* SOURCE TEXT */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Source brute
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Collez ici le texte source à analyser…"
          className="border rounded p-2 w-full h-48"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* ACTION */}
      <button
        onClick={validate}
        className="bg-ratecard-blue text-white px-4 py-2 rounded"
      >
        Continuer
      </button>
    </div>
  );
}
