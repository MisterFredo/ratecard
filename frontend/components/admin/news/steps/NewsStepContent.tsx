"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  title: string;
  body: string;
  company: any | null;
  topics: any[];
  persons: any[];

  onChange: (d: {
    title?: string;
    body?: string;
    company?: any | null;
    topics?: any[];
    persons?: any[];
  }) => void;

  onValidate: () => void;
  saving: boolean;
};

export default function NewsStepContent({
  title,
  body,
  company,
  topics,
  persons,
  onChange,
  onValidate,
  saving,
}: Props) {
  const [aiLoading, setAiLoading] = useState(false);

  /* ---------------------------------------------------------
     IA — AIDE À L'ÉCRITURE (LÉGÈRE)
  --------------------------------------------------------- */
  async function aiHelp() {
    if (!title && !body) {
      alert("Renseigne au moins un titre ou un texte");
      return;
    }

    setAiLoading(true);

    try {
      const res = await api.post("/news/ai/help", {
        title,
        body,
        company: company?.NAME || null,
      });

      if (res.title) onChange({ title: res.title });
      if (res.body) onChange({ body: res.body });
    } catch (e) {
      console.error(e);
      alert("❌ Erreur IA");
    }

    setAiLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* SOCIÉTÉ */}
      <div>
        <label className="block font-medium mb-1">Société *</label>
        <CompanySelect
          value={company}
          onChange={(c) => onChange({ company: c })}
        />
      </div>

      {/* TITRE */}
      <div>
        <label className="block font-medium mb-1">Titre *</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>

      {/* TEXTE */}
      <div>
        <label className="block font-medium mb-1">Texte</label>
        <textarea
          className="w-full border rounded p-2 h-32"
          value={body}
          onChange={(e) => onChange({ body: e.target.value })}
        />
      </div>

      {/* IA */}
      <div>
        <button
          type="button"
          className="px-3 py-2 bg-gray-100 border rounded text-sm"
          onClick={aiHelp}
          disabled={aiLoading}
        >
          {aiLoading ? "IA en cours…" : "Aide IA à l’écriture"}
        </button>
      </div>

      {/* TOPICS */}
      <div>
        <label className="block font-medium mb-1">Topics (badges)</label>
        <TopicMultiSelect
          values={topics}
          onChange={(t) => onChange({ topics: t })}
        />
      </div>

      {/* PERSONS */}
      <div>
        <label className="block font-medium mb-1">Personnes</label>
        <PersonMultiSelect
          values={persons}
          onChange={(p) => onChange({ persons: p })}
        />
      </div>

      {/* ACTION */}
      <div className="pt-4">
        <button
          onClick={onValidate}
          disabled={saving}
          className="bg-ratecard-green text-white px-4 py-2 rounded"
        >
          {saving ? "Sauvegarde…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PLACEHOLDERS (à remplacer par tes composants existants)
============================================================ */

function CompanySelect({ value, onChange }: any) {
  return (
    <div className="border rounded p-2 text-sm text-gray-500">
      Sélecteur société (existant)
    </div>
  );
}

function TopicMultiSelect({ values, onChange }: any) {
  return (
    <div className="border rounded p-2 text-sm text-gray-500">
      Sélecteur topics (existant)
    </div>
  );
}

function PersonMultiSelect({ values, onChange }: any) {
  return (
    <div className="border rounded p-2 text-sm text-gray-500">
      Sélecteur persons (existant)
    </div>
  );
}
