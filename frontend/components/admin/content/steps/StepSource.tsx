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

    if (sourceText.trim().length < 80) {
      alert("La source semble trop courte.");
      return;
    }

    onSubmit({
      type: sourceType,
      text: sourceText.trim(),
    });
  }

  const charCount = sourceText.length;

  return (
    <div className="space-y-6">

      {/* TYPE + INFO EN LIGNE */}
      <div className="flex flex-col md:flex-row md:items-end md:gap-6 gap-4">

        <div className="flex-1 space-y-1">
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

        <div className="text-xs text-gray-500 md:mb-2">
          {charCount} caractères
        </div>

      </div>

      {/* SOURCE */}
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

      {/* ACTION */}
      <div>
        <button
          onClick={validate}
          className="bg-ratecard-blue text-white px-5 py-2 rounded font-medium"
        >
          Générer le résumé
        </button>
      </div>

    </div>
  );
}
