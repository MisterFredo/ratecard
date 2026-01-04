"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import PersonSelector, {
  ArticlePerson,
} from "@/components/admin/PersonSelector";

type SourceType =
  | "LINKEDIN_POST"
  | "PRESS_RELEASE"
  | "ARTICLE"
  | "INTERVIEW"
  | "OTHER";

type Draft = {
  title?: string;
  excerpt?: string;
  content_html?: string;
  outro?: string;
};

type Props = {
  topics: { id_topic: string; label: string }[];
  companies: { id_company: string; name: string }[];
  persons: ArticlePerson[];

  onApplyDraft: (draft: Draft) => void;
  onSkip: () => void;
};

export default function StepSource({
  topics,
  companies,
  persons,
  onApplyDraft,
  onSkip,
}: Props) {
  const [sourceType, setSourceType] =
    useState<SourceType>("LINKEDIN_POST");
  const [sourceText, setSourceText] = useState("");
  const [author, setAuthor] = useState<ArticlePerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function transform() {
    if (!sourceText.trim()) {
      alert("Merci de fournir une source à transformer.");
      return;
    }

    if (author.length === 0) {
      alert("Merci de sélectionner un auteur.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/lab-light/transform", {
        source_type: sourceType,
        source_text: sourceText,
        author: author[0].name,
        context: {
          topics: topics.map((t) => t.label),
          companies: companies.map((c) => c.name),
          persons: persons.map((p) => ({
            name: p.name,
            role: p.role,
          })),
        },
      });

      // 🔑 SUPPORT DES DEUX FORMATS POSSIBLES
      const draft: Draft = res?.draft ?? res;

      console.log("IA draft reçu :", draft);

      if (
        !draft ||
        (!draft.title &&
          !draft.excerpt &&
          !draft.content_html &&
          !draft.outro)
      ) {
        alert("Le brouillon généré est vide.");
        setLoading(false);
        return;
      }

      onApplyDraft({
        title: draft.title || "",
        excerpt: draft.excerpt || "",
        content_html: draft.content_html || "",
        outro: draft.outro || "",
      });

      setGenerated(true);
    } catch (e) {
      console.error(e);
      alert("Erreur IA");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Vous pouvez partir d’une source existante pour générer un brouillon
        d’article à l’aide de l’assistant.
      </p>

      <div className="space-y-1">
        <label className="text-sm font-medium">Type de source</label>
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

      <PersonSelector values={author} onChange={setAuthor} />

      <div className="space-y-1">
        <label className="text-sm font-medium">Source brute</label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="border rounded p-2 w-full h-40"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={transform}
          disabled={loading}
          className="bg-ratecard-blue text-white px-4 py-2 rounded"
        >
          {loading
            ? "Génération en cours…"
            : "Transformer la source (assistant)"}
        </button>

        <button
          onClick={onSkip}
          className="px-4 py-2 border rounded"
        >
          Passer cette étape
        </button>
      </div>

      {generated && (
        <div className="text-sm text-green-700">
          Un brouillon a été généré. Merci de relire et ajuster le contenu.
        </div>
      )}
    </div>
  );
}
