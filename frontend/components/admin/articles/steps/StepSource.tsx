"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import ArticleSourcePanel from "@/components/admin/articles/ArticleSourcePanel";
import PersonSelector, {
  ArticlePerson,
} from "@/components/admin/PersonSelector";

type SourceType =
  | "LINKEDIN_POST"
  | "PRESS_RELEASE"
  | "ARTICLE"
  | "INTERVIEW"
  | "OTHER";

type Props = {
  topics: { id_topic: string; label: string }[];
  companies: { id_company: string; name: string }[];
  persons: ArticlePerson[];

  onApplyDraft: (draft: {
    title?: string;
    excerpt?: string;
    content_html?: string;
    outro?: string;
  }) => void;

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

  /* ---------------------------------------------------------
     TRANSFORM SOURCE → ARTICLE (IA)
  --------------------------------------------------------- */
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
        author: author[0].name, // autorité humaine claire
        context: {
          topics: topics.map((t) => t.label),
          companies: companies.map((c) => c.name),
          persons: persons.map((p) => ({
            name: p.name,
            role: p.role,
          })),
        },
      });

      if (!res || res.error) {
        console.error(res);
        alert("Erreur lors de la génération du brouillon.");
        setLoading(false);
        return;
      }

      onApplyDraft({
        title: res.title_proposal || "",
        excerpt: res.excerpt || "",
        content_html: res.content_html || "",
        outro: res.notes || "",
      });

      setGenerated(true);
    } catch (e) {
      console.error(e);
      alert("Erreur IA");
    }

    setLoading(false);
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-5">

      <p className="text-sm text-gray-600">
        Vous pouvez partir d’une source existante pour générer un brouillon
        d’article à l’aide de l’assistant.
      </p>

      {/* TYPE DE SOURCE */}
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

      {/* AUTEUR */}
      <div>
        <PersonSelector
          values={author}
          onChange={setAuthor}
        />
      </div>

      {/* SOURCE */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Source brute
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Collez ici le texte source à transformer…"
          className="border rounded p-2 w-full h-40"
        />
      </div>

      {/* ACTIONS */}
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
