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
    type: SourceType;
    text: string;
  }) => void;
};

export default function StepSource({ onSubmit }: Props) {
  const [sourceType, setSourceType] =
    useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");

  function validate() {
    if (!sourceText.trim()) {
      alert("Merci de fournir une source.");
      return;
    }

    onSubmit({
      type: sourceType,
      text: sourceText,
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Vous pouvez partir d’une source existante (post, article, interview,
        etc.) pour analyser un signal et produire un contenu structuré.
      </p>

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

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Source brute
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-2 w-full h-40"
          placeholder="Collez ici le texte source à analyser…"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={validate}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
