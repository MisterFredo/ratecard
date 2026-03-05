"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Source = {
  SOURCE_ID: string;
  NAME: string;
};

type Props = {
  onCreate: (data: {
    source_id: string;
    text: string;
  }) => void;
};

export default function StepSource({ onCreate }: Props) {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [sourceText, setSourceText] = useState("");

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
  // HANDLE SUBMIT (NO CREATION)
  // ==========================================================

  function handleSubmit() {
    if (!isValid) return;

    onCreate({
      source_id: sourceId,
      text: sourceText.trim(),
    });
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="bg-white border rounded p-5 shadow-sm space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">
          Source
        </h2>

        <div className="text-xs text-gray-500">
          {charCount} caractères
        </div>
      </div>

      {/* SELECT SOURCE */}

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Source
        </label>

        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          className="border rounded p-2 w-full text-sm"
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

      {/* TEXT AREA */}

      <div className="space-y-1">
        <label className="text-sm font-medium">
          Texte brut
        </label>

        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-3 w-full h-44 text-sm"
          placeholder="Collez ici la source à analyser..."
        />

        <p className="text-xs text-gray-500">
          Minimum recommandé : 80 caractères
        </p>
      </div>

      {/* ACTION */}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`px-4 py-2 rounded text-white text-sm w-full ${
          isValid
            ? "bg-black hover:bg-gray-800"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Analyser la source
      </button>

    </div>
  );
}
